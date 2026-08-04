import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CubeIcon, DownloadIcon, SearchIcon } from '@heroicons/react/outline';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import http from '@/api/http';
import createDirectory from '@/api/server/files/createDirectory';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash, { useFlashKey } from '@/plugins/useFlash';
import styles from './style.module.css';

type Loader = 'fabric' | 'forge' | 'neoforge' | 'quilt' | '';

interface ModrinthHit {
    project_id: string;
    slug: string;
    title: string;
    description: string;
    author: string;
    icon_url: string | null;
    downloads: number;
    categories: string[];
    versions: string[];
    project_type: string;
}

interface ModrinthSearchResponse {
    hits: ModrinthHit[];
}

interface ModrinthFile {
    url: string;
    filename: string;
    primary: boolean;
}

interface ModrinthVersion {
    name: string;
    version_number: string;
    game_versions: string[];
    loaders: string[];
    files: ModrinthFile[];
}

const MODRINTH_API = 'https://api.modrinth.com/v2';
const isSafeModrinthDownload = (file: ModrinthFile): boolean =>
    /^https:\/\/cdn\.modrinth\.com\//.test(file.url) && /\.jar$/i.test(file.filename);
const formatDownloads = (downloads: number): string => new Intl.NumberFormat().format(downloads);

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data!.name);
    const modsInstaller = useStoreState((state) => state.settings.data?.vantablack.modsInstaller ?? true);
    const modsInstallerEnabled = String(modsInstaller) === 'true';
    const defaultLoader = useStoreState(
        (state) => state.settings.data?.vantablack.modsDefaultLoader ?? 'fabric'
    ) as Loader;
    const defaultVersion = useStoreState(
        (state) => state.settings.data?.vantablack.modsDefaultVersion ?? ''
    );
    const { addFlash } = useFlash();
    const { clearAndAddHttpError, addError, clearFlashes } = useFlashKey('minecraft-mods');

    const [query, setQuery] = useState('');
    const [loader, setLoader] = useState<Loader>(defaultLoader);
    const [gameVersion, setGameVersion] = useState(defaultVersion);
    const [results, setResults] = useState<ModrinthHit[]>([]);
    const [isSearching, setSearching] = useState(false);
    const [installingProject, setInstallingProject] = useState<string | null>(null);

    const facets = useMemo(() => {
        const values: string[][] = [['project_type:mod']];
        if (loader) values.push([`categories:${loader}`]);
        if (gameVersion.trim()) values.push([`versions:${gameVersion.trim()}`]);

        return JSON.stringify(values);
    }, [gameVersion, loader]);

    const search = useCallback(async () => {
        clearFlashes();
        setSearching(true);
        try {
            const params = new URLSearchParams({
                query: query.trim(),
                facets,
                limit: '24',
                index: 'relevance',
            });
            const response = await fetch(`${MODRINTH_API}/search?${params.toString()}`);
            if (!response.ok) throw new Error('Modrinth could not load the mod catalog. Please try again.');

            const data = (await response.json()) as ModrinthSearchResponse;
            setResults(data.hits.filter((project) => project.project_type === 'mod'));
        } catch (error) {
            addError(error instanceof Error ? error.message : 'Unable to load the Modrinth catalog.', 'Catalog unavailable');
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, [addError, clearFlashes, facets, query]);

    useEffect(() => {
        void search();
    }, [search]);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        void search();
    };

    const install = async (project: ModrinthHit) => {
        clearFlashes();
        setInstallingProject(project.project_id);
        try {
            const params = new URLSearchParams();
            if (loader) params.set('loaders', JSON.stringify([loader]));
            if (gameVersion.trim()) params.set('game_versions', JSON.stringify([gameVersion.trim()]));

            const response = await fetch(`${MODRINTH_API}/project/${project.project_id}/version?${params.toString()}`);
            if (!response.ok) throw new Error('No compatible version could be loaded from Modrinth.');

            const versions = (await response.json()) as ModrinthVersion[];
            const version = versions.find((entry) => entry.files.some(isSafeModrinthDownload));
            const file = version?.files.find((entry) => entry.primary && isSafeModrinthDownload(entry))
                ?? version?.files.find(isSafeModrinthDownload);

            if (!version || !file) {
                throw new Error('No compatible .jar file was found. Select the server loader and Minecraft version, then try again.');
            }

            try {
                await createDirectory(uuid, '/', 'mods');
            } catch (error) {
                const status = (error as { response?: { status?: number } }).response?.status;
                if (status !== 409) throw error;
            }

            // Try the pull endpoint first (Pterodactyl 1.11+), fall back to download-from-url
            try {
                await http.post(`/api/client/servers/${uuid}/files/pull`, {
                    url: file.url,
                    directory: 'mods',
                    filename: file.filename,
                });
            } catch (pullError) {
                const pullStatus = (pullError as { response?: { status?: number } }).response?.status;
                // If pull endpoint doesn't exist (404/405), try the write approach via download
                if (pullStatus === 404 || pullStatus === 405 || pullStatus === 500) {
                    // Download the file content through Modrinth CDN and write it
                    const downloadResponse = await fetch(file.url);
                    if (!downloadResponse.ok) throw new Error('Failed to download mod file from Modrinth CDN.');
                    const blob = await downloadResponse.blob();
                    
                    await http.post(
                        `/api/client/servers/${uuid}/files/write`,
                        blob,
                        {
                            params: { file: `/mods/${file.filename}` },
                            headers: { 'Content-Type': 'application/octet-stream' },
                        }
                    );
                } else {
                    throw pullError;
                }
            }

            addFlash({
                key: 'minecraft-mods',
                type: 'success',
                title: 'Install queued',
                message: `${project.title} (${version.version_number}) is being downloaded into /mods.`,
            });
        } catch (error) {
            if (error instanceof Error && !('response' in error)) {
                addError(error.message, 'Install failed');
            } else {
                clearAndAddHttpError(error instanceof Error ? error : null);
            }
        } finally {
            setInstallingProject(null);
        }
    };

    if (!modsInstallerEnabled) {
        return (
            <div className={styles.emptyState}>
                <CubeIcon className={'w-10 h-10'} />
                <h2>Mod installer disabled</h2>
                <p>The VantaHost administrator has disabled the Minecraft mod catalog for this panel.</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <FlashMessageRender byKey={'minecraft-mods'} />
            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>VantaHost Studio</span>
                    <h2>Minecraft mod installer</h2>
                    <p>Browse trusted Modrinth projects and install a compatible mod directly to <code>/mods</code> on {serverName}.</p>
                </div>
                <div className={styles.heroIcon}><CubeIcon /></div>
            </section>

            <form className={styles.filters} onSubmit={submitSearch}>
                <label className={styles.searchField}>
                    <SearchIcon className={'w-5 h-5'} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={'Search mods — e.g. Sodium, Essentials, Create'}
                        aria-label={'Search Modrinth mods'}
                    />
                </label>
                <label>
                    <span>Loader</span>
                    <select value={loader} onChange={(event) => setLoader(event.target.value as Loader)}>
                        <option value="">Any loader</option>
                        <option value="fabric">Fabric</option>
                        <option value="forge">Forge</option>
                        <option value="neoforge">NeoForge</option>
                        <option value="quilt">Quilt</option>
                    </select>
                </label>
                <label>
                    <span>Minecraft version</span>
                    <input value={gameVersion} onChange={(event) => setGameVersion(event.target.value)} placeholder={'1.21.1'} />
                </label>
                <button className={styles.searchButton} type={'submit'} disabled={isSearching}>
                    <SearchIcon className={'w-4 h-4'} /> {isSearching ? 'Searching…' : 'Search'}
                </button>
            </form>

            <p className={styles.helper}>Only Modrinth CDN <code>.jar</code> files are eligible. Check your server software, loader, and Minecraft version before installing.</p>

            <div className={styles.grid} aria-busy={isSearching}>
                {results.map((project) => (
                    <article className={styles.modCard} key={project.project_id}>
                        <div className={styles.cardHeader}>
                            {project.icon_url ? <img src={project.icon_url} alt="" /> : <CubeIcon className={'w-10 h-10'} />}
                            <div>
                                <h3>{project.title}</h3>
                                <p>by {project.author}</p>
                            </div>
                        </div>
                        <p className={styles.description}>{project.description}</p>
                        <div className={styles.tags}>
                            {project.categories.slice(0, 4).map((category) => <span key={category}>{category}</span>)}
                        </div>
                        <div className={styles.cardFooter}>
                            <span><DownloadIcon className={'w-4 h-4'} /> {formatDownloads(project.downloads)}</span>
                            <button
                                type={'button'}
                                onClick={() => void install(project)}
                                disabled={installingProject !== null}
                                title={'Download the newest compatible jar directly into /mods'}
                            >
                                <DownloadIcon className={'w-4 h-4'} />
                                {installingProject === project.project_id ? 'Installing…' : 'Install'}
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {!isSearching && results.length === 0 && <div className={styles.noResults}>No mods matched those filters. Try a different search or remove a compatibility filter.</div>}
        </div>
    );
};
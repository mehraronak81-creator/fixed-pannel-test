import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CubeIcon, DownloadIcon, SearchIcon } from '@heroicons/react/outline';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import http from '@/api/http';
import createDirectory from '@/api/server/files/createDirectory';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash, { useFlashKey } from '@/plugins/useFlash';
import styles from './style.module.css';

type Loader = 'fabric' | 'forge' | 'neoforge' | 'quilt' | 'paper' | 'spigot' | 'bukkit' | 'purpur' | 'velocity' | 'bungeecord' | 'waterfall' | '';
// A "content kind" maps to a Modrinth project_type and the folder the file is
// installed into. Paper/Spigot/Bukkit servers use PLUGINS (in /plugins), while
// Fabric/Forge use MODS (in /mods). Only searching for mods was the reason
// plugin downloads never appeared for most Minecraft servers.
type ContentKind = 'mod' | 'plugin';
const PLUGIN_LOADERS: Loader[] = ['paper', 'spigot', 'bukkit', 'purpur', 'velocity', 'bungeecord', 'waterfall'];

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
const kindForLoader = (loader: Loader): ContentKind => (PLUGIN_LOADERS.includes(loader) ? 'plugin' : 'mod');
const installDirForKind = (kind: ContentKind): string => (kind === 'plugin' ? 'plugins' : 'mods');

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

    // The kind of content we are searching for is derived from the selected
    // loader: plugin loaders (Paper/Spigot/etc.) look for plugins, everything
    // else looks for mods. With no loader selected we search BOTH so nothing
    // is silently hidden.
    const contentKind: ContentKind | null = loader ? kindForLoader(loader) : null;

    const facets = useMemo(() => {
        const values: string[][] = [];
        // project_type facet: an OR-group of the types we accept.
        if (contentKind === 'plugin') values.push(['project_type:plugin']);
        else if (contentKind === 'mod') values.push(['project_type:mod']);
        else values.push(['project_type:mod', 'project_type:plugin']);

        // Loader facet. On the Modrinth search API loaders are indexed under
        // the `categories` facet, so this is correct for both mod loaders
        // (fabric/forge/…) and plugin platforms (paper/spigot/…).
        if (loader) values.push([`categories:${loader}`]);
        if (gameVersion.trim()) values.push([`versions:${gameVersion.trim()}`]);

        return JSON.stringify(values);
    }, [contentKind, gameVersion, loader]);

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
            if (!response.ok) throw new Error('Modrinth could not load the catalog. Please try again.');

            const data = (await response.json()) as ModrinthSearchResponse;
            // Keep both mods and plugins; only drop unrelated project types
            // (resourcepacks, shaders, datapacks, modpacks).
            setResults(
                data.hits.filter(
                    (project) => project.project_type === 'mod' || project.project_type === 'plugin'
                )
            );
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
            // A plugin project always installs to /plugins even if the current
            // loader filter is "any"; likewise a mod project goes to /mods.
            const kind: ContentKind = project.project_type === 'plugin' ? 'plugin' : 'mod';
            const targetDir = installDirForKind(kind);

            // Fetch the FULL version list unfiltered, then pick the best match
            // ourselves. Passing loaders/game_versions to the API is brittle:
            // one over-strict filter (e.g. a loader the project doesn't tag)
            // makes Modrinth return an empty list and the install "silently"
            // fails. Client-side filtering with graceful fallback fixes that.
            const response = await fetch(`${MODRINTH_API}/project/${project.project_id}/version`);
            if (!response.ok) throw new Error('No versions could be loaded from Modrinth.');

            const versions = (await response.json()) as ModrinthVersion[];
            const wantLoader = loader ? loader.toLowerCase() : '';
            const wantVersion = gameVersion.trim();

            const matchesLoader = (v: ModrinthVersion) =>
                !wantLoader || v.loaders.map((l) => l.toLowerCase()).includes(wantLoader);
            const matchesVersion = (v: ModrinthVersion) =>
                !wantVersion || v.game_versions.includes(wantVersion);
            const hasSafeFile = (v: ModrinthVersion) => v.files.some(isSafeModrinthDownload);

            // Prefer an exact loader+version match, then loosen progressively so
            // a mod still installs even when the user left a filter blank.
            const version =
                versions.find((v) => matchesLoader(v) && matchesVersion(v) && hasSafeFile(v)) ??
                versions.find((v) => matchesLoader(v) && hasSafeFile(v)) ??
                versions.find((v) => matchesVersion(v) && hasSafeFile(v)) ??
                versions.find(hasSafeFile);

            const file = version?.files.find((entry) => entry.primary && isSafeModrinthDownload(entry))
                ?? version?.files.find(isSafeModrinthDownload);

            if (!version || !file) {
                throw new Error('No compatible .jar file was found. Adjust the loader or Minecraft version and try again.');
            }

            try {
                await createDirectory(uuid, '/', targetDir);
            } catch (error) {
                const status = (error as { response?: { status?: number } }).response?.status;
                if (status !== 400 && status !== 409) throw error;
            }

            await http.post(`/api/client/servers/${uuid}/files/pull`, {
                url: file.url,
                directory: targetDir,
                filename: file.filename,
            });

            addFlash({
                key: 'minecraft-mods',
                type: 'success',
                title: 'Install queued',
                message: `${project.title} (${version.version_number}) is being downloaded into /${targetDir}.`,
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
                    <h2>Minecraft mod &amp; plugin installer</h2>
                    <p>Browse trusted Modrinth projects and install a compatible mod or plugin directly to <code>/mods</code> or <code>/plugins</code> on {serverName}.</p>
                </div>
                <div className={styles.heroIcon}><CubeIcon /></div>
            </section>

            <form className={styles.filters} onSubmit={submitSearch}>
                <label className={styles.searchField}>
                    <SearchIcon className={'w-5 h-5'} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={'Search mods & plugins — e.g. Sodium, EssentialsX, Create'}
                        aria-label={'Search Modrinth mods and plugins'}
                    />
                </label>
                <label>
                    <span>Server type</span>
                    <select value={loader} onChange={(event) => setLoader(event.target.value as Loader)}>
                        <option value="">Any (mods &amp; plugins)</option>
                        <optgroup label="Mods">
                            <option value="fabric">Fabric</option>
                            <option value="forge">Forge</option>
                            <option value="neoforge">NeoForge</option>
                            <option value="quilt">Quilt</option>
                        </optgroup>
                        <optgroup label="Plugins">
                            <option value="paper">Paper</option>
                            <option value="purpur">Purpur</option>
                            <option value="spigot">Spigot</option>
                            <option value="bukkit">Bukkit</option>
                            <option value="velocity">Velocity</option>
                            <option value="bungeecord">BungeeCord</option>
                            <option value="waterfall">Waterfall</option>
                        </optgroup>
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

            <p className={styles.helper}>Only Modrinth CDN <code>.jar</code> files are eligible. Mods install to <code>/mods</code> and plugins install to <code>/plugins</code>. Pick your server type and Minecraft version for the best match before installing.</p>

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
                            <span>{project.project_type === 'plugin' ? 'plugin \u2192 /plugins' : 'mod \u2192 /mods'}</span>
                            {project.categories.slice(0, 3).map((category) => <span key={category}>{category}</span>)}
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

            {!isSearching && results.length === 0 && <div className={styles.noResults}>No mods or plugins matched those filters. Try a different search or remove a compatibility filter.</div>}
        </div>
    );
};
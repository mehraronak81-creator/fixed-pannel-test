import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CubeTransparentIcon,
    UsersIcon,
    AdjustmentsIcon,
    RefreshIcon,
    SearchIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    LoginIcon,
    BanIcon,
    SpeakerphoneIcon,
    SaveIcon,
    ExclamationIcon,
    UserGroupIcon,
} from '@heroicons/react/outline';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import Can from '@/components/elements/Can';
import { usePermissions } from '@/plugins/usePermissions';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash, { useFlashKey } from '@/plugins/useFlash';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';
import usePlayers from './usePlayers';
import { parseProperties, serializeProperties, ParsedProperties } from './properties';
import { SETTING_SECTIONS, SettingDefinition } from './settings';
import styles from './style.module.css';

const PROPERTIES_PATH = '/server.properties';

type Tab = 'players' | 'settings';

const avatarUrl = (name: string): string =>
    `https://mc-heads.net/avatar/${encodeURIComponent(name)}/40`;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('minecraft-manager');
    const { addFlash } = useFlash();

    const isOnline = status === 'running';
    const [canControlConsole] = usePermissions(['control.console']);

    const [tab, setTab] = useState<Tab>('players');

    /* ----------------------------- Players ----------------------------- */
    const { players, refresh } = usePlayers();
    const [playerQuery, setPlayerQuery] = useState('');
    const [broadcast, setBroadcast] = useState('');

    // On mount (and when the socket reconnects while running) sync the roster.
    useEffect(() => {
        if (isOnline && connected) {
            const timer = window.setTimeout(refresh, 600);
            return () => window.clearTimeout(timer);
        }
        return undefined;
    }, [isOnline, connected, refresh]);

    const sendCommand = useCallback(
        (command: string) => {
            if (!connected || !instance || !isOnline) return;
            instance.send('send command', command);
        },
        [connected, instance, isOnline]
    );

    const filteredPlayers = useMemo(() => {
        const q = playerQuery.trim().toLowerCase();
        if (!q) return players;
        return players.filter((p) => p.name.toLowerCase().includes(q));
    }, [players, playerQuery]);

    const doBroadcast = useCallback(() => {
        const message = broadcast.trim();
        if (!message) return;
        sendCommand(`say ${message}`);
        setBroadcast('');
    }, [broadcast, sendCommand]);

    /* ----------------------------- Settings ----------------------------- */
    const [parsed, setParsed] = useState<ParsedProperties | null>(null);
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [loadingProps, setLoadingProps] = useState(true);
    const [propsMissing, setPropsMissing] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadProperties = useCallback(() => {
        setLoadingProps(true);
        setPropsMissing(false);
        clearFlashes();
        getFileContents(uuid, PROPERTIES_PATH)
            .then((content) => {
                const next = parseProperties(content);
                setParsed(next);
                setDraft(next.values);
            })
            .catch((error) => {
                // A 404 simply means this server has no server.properties yet.
                if (error?.response?.status === 404) {
                    setPropsMissing(true);
                    setParsed(null);
                } else {
                    clearAndAddHttpError(error);
                }
            })
            .then(() => setLoadingProps(false));
    }, [uuid, clearFlashes, clearAndAddHttpError]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const dirtyKeys = useMemo(() => {
        if (!parsed) return [] as string[];
        return Object.keys(draft).filter((key) => (parsed.values[key] ?? '') !== draft[key]);
    }, [parsed, draft]);

    const isDirty = dirtyKeys.length > 0;

    const setValue = useCallback((key: string, value: string) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    }, []);

    const saveProperties = useCallback(() => {
        if (!parsed || !isDirty) return;
        setSaving(true);
        clearFlashes();

        const updates: Record<string, string> = {};
        dirtyKeys.forEach((key) => {
            updates[key] = draft[key];
        });

        const content = serializeProperties(parsed, updates);
        saveFileContents(uuid, PROPERTIES_PATH, content)
            .then(() => {
                const next = parseProperties(content);
                setParsed(next);
                setDraft(next.values);
                addFlash({
                    key: 'minecraft-manager',
                type: 'success',
                    message: isOnline
                        ? 'server.properties saved. Restart the server to apply the changes.'
                        : 'server.properties saved.',
                });
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setSaving(false));
    }, [parsed, isDirty, dirtyKeys, draft, uuid, isOnline, clearFlashes, clearAndAddHttpError, addFlash]);

    const resetDraft = useCallback(() => {
        if (parsed) setDraft(parsed.values);
    }, [parsed]);

    return (
        <ServerContentBlock title={'Minecraft'} icon={CubeTransparentIcon}>
            <div className={styles.page}>
                <FlashMessageRender byKey={'minecraft-manager'} />

                <div className={styles.hero}>
                    <div>
                        <span className={styles.eyebrow}>Minecraft</span>
                        <h2>Server Manager</h2>
                        <p>
                            Manage online players and fine-tune your <code>server.properties</code> without
                            touching a config file. Player actions run live through the console; settings apply
                            after the next restart.
                        </p>
                        <span className={`${styles.heroStatus} ${isOnline ? styles.online : styles.offline}`}>
                            <span className={styles.dot} />
                            {isOnline ? 'Server online' : 'Server offline'}
                        </span>
                    </div>
                    <div className={styles.heroIcon}>
                        <CubeTransparentIcon />
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === 'players' ? styles.tabActive : ''}`}
                        onClick={() => setTab('players')}
                        type={'button'}
                    >
                        <UsersIcon /> Players
                        {players.length > 0 && ` (${players.length})`}
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'settings' ? styles.tabActive : ''}`}
                        onClick={() => setTab('settings')}
                        type={'button'}
                    >
                        <AdjustmentsIcon /> Settings
                    </button>
                </div>

                {tab === 'players' ? (
                    <PlayersPanel
                        isOnline={isOnline}
                        canControlConsole={canControlConsole}
                        players={filteredPlayers}
                        totalPlayers={players.length}
                        query={playerQuery}
                        setQuery={setPlayerQuery}
                        refresh={refresh}
                        sendCommand={sendCommand}
                        broadcast={broadcast}
                        setBroadcast={setBroadcast}
                        doBroadcast={doBroadcast}
                    />
                ) : (
                    <SettingsPanel
                        loading={loadingProps}
                        missing={propsMissing}
                        draft={draft}
                        original={parsed?.values ?? {}}
                        dirtyCount={dirtyKeys.length}
                        saving={saving}
                        setValue={setValue}
                        save={saveProperties}
                        reset={resetDraft}
                        reload={loadProperties}
                    />
                )}
            </div>
        </ServerContentBlock>
    );
};

/* ============================== Players ============================== */

interface PlayersPanelProps {
    isOnline: boolean;
    canControlConsole: boolean;
    players: { name: string; since: number }[];
    totalPlayers: number;
    query: string;
    setQuery: (v: string) => void;
    refresh: () => void;
    sendCommand: (command: string) => void;
    broadcast: string;
    setBroadcast: (v: string) => void;
    doBroadcast: () => void;
}

const PlayersPanel: React.FC<PlayersPanelProps> = ({
    isOnline,
    canControlConsole,
    players,
    totalPlayers,
    query,
    setQuery,
    refresh,
    sendCommand,
    broadcast,
    setBroadcast,
    doBroadcast,
}) => (
    <div className={styles.panel}>
        <div className={styles.panelHead}>
            <div>
                <h3>Online players</h3>
                <p>Actions are sent to the server console instantly.</p>
            </div>
            <button className={styles.ghostButton} onClick={refresh} disabled={!isOnline} type={'button'}>
                <RefreshIcon /> Refresh
            </button>
        </div>

        {!isOnline && (
            <div className={styles.offlineNote}>
                <ExclamationIcon />
                The server is offline. Start it to see connected players and run commands.
            </div>
        )}

        <div className={styles.playerBar}>
            <div className={styles.searchField}>
                <SearchIcon />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    placeholder={'Filter players…'}
                    aria-label={'Filter players'}
                />
            </div>
        </div>

        {players.length === 0 ? (
            <div className={styles.emptyState}>
                <UserGroupIcon />
                <h4>{totalPlayers === 0 ? 'No players online' : 'No players match your filter'}</h4>
                <p>
                    {totalPlayers === 0
                        ? isOnline
                            ? 'When players join, they will appear here automatically.'
                            : 'Start the server to track player activity.'
                        : 'Try a different search term.'}
                </p>
            </div>
        ) : (
            <div className={styles.playerList}>
                {players.map((player) => (
                    <PlayerCard key={player.name} name={player.name} sendCommand={sendCommand} disabled={!isOnline || !canControlConsole} />
                ))}
            </div>
        )}
        {!canControlConsole && <div className={styles.offlineNote}><ExclamationIcon /> You can view players, but your subuser role cannot run console commands.</div>}

        <Can action={'control.console'}>
            <div className={styles.broadcast}>
                <input
                    value={broadcast}
                    onChange={(e) => setBroadcast(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doBroadcast()}
                    placeholder={'Broadcast a message to everyone…'}
                    disabled={!isOnline}
                    aria-label={'Broadcast message'}
                />
                <button className={styles.primaryButton} onClick={doBroadcast} disabled={!isOnline || !broadcast.trim()} type={'button'}>
                    <SpeakerphoneIcon /> Broadcast
                </button>
            </div>
        </Can>
    </div>
);

interface PlayerCardProps {
    name: string;
    sendCommand: (command: string) => void;
    disabled: boolean;
}

const GAMEMODES = ['survival', 'creative', 'adventure', 'spectator'];

const PlayerCard: React.FC<PlayerCardProps> = ({ name, sendCommand, disabled }) => {
    const [confirmBan, setConfirmBan] = useState(false);

    return (
        <div className={styles.playerCard}>
            <div className={styles.playerTop}>
                <img className={styles.avatar} src={avatarUrl(name)} alt={name} loading={'lazy'} />
                <div>
                    <p className={styles.playerName}>{name}</p>
                    <p className={styles.playerMeta}>Connected</p>
                </div>
            </div>
            <div className={styles.actions}>
                <button className={styles.actionOp} onClick={() => sendCommand(`op ${name}`)} disabled={disabled} type={'button'}>
                    <ShieldCheckIcon /> Op
                </button>
                <button onClick={() => sendCommand(`deop ${name}`)} disabled={disabled} type={'button'}>
                    <ShieldExclamationIcon /> De-op
                </button>
                <button onClick={() => sendCommand(`whitelist add ${name}`)} disabled={disabled} type={'button'}>
                    <LoginIcon /> Whitelist
                </button>
                <select
                    onChange={(e) => {
                        if (e.currentTarget.value) {
                            sendCommand(`gamemode ${e.currentTarget.value} ${name}`);
                            e.currentTarget.value = '';
                        }
                    }}
                    disabled={disabled}
                    defaultValue={''}
                    aria-label={`Set gamemode for ${name}`}
                >
                    <option value={''} disabled>
                        Gamemode…
                    </option>
                    {GAMEMODES.map((mode) => (
                        <option key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </option>
                    ))}
                </select>
                <button className={styles.actionKick} onClick={() => sendCommand(`kick ${name}`)} disabled={disabled} type={'button'}>
                    Kick
                </button>
                {confirmBan ? (
                    <button
                        className={styles.actionBan}
                        onClick={() => {
                            sendCommand(`ban ${name}`);
                            setConfirmBan(false);
                        }}
                        disabled={disabled}
                        type={'button'}
                    >
                        <BanIcon /> Confirm ban
                    </button>
                ) : (
                    <button className={styles.actionBan} onClick={() => setConfirmBan(true)} disabled={disabled} type={'button'}>
                        <BanIcon /> Ban
                    </button>
                )}
            </div>
        </div>
    );
};

/* ============================== Settings ============================== */

interface SettingsPanelProps {
    loading: boolean;
    missing: boolean;
    draft: Record<string, string>;
    original: Record<string, string>;
    dirtyCount: number;
    saving: boolean;
    setValue: (key: string, value: string) => void;
    save: () => void;
    reset: () => void;
    reload: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    loading,
    missing,
    draft,
    original,
    dirtyCount,
    saving,
    setValue,
    save,
    reset,
    reload,
}) => {
    if (loading) {
        return (
            <div className={styles.panel}>
                <div className={styles.spinnerWrap}>
                    <Spinner size={'large'} />
                    <span>Loading server.properties…</span>
                </div>
            </div>
        );
    }

    if (missing) {
        return (
            <div className={styles.panel}>
                <div className={styles.emptyState}>
                    <ExclamationIcon />
                    <h4>No server.properties found</h4>
                    <p>
                        This does not look like a Minecraft server, or it has not generated its config yet. Start the
                        server once to create it, then reload.
                    </p>
                    <button className={styles.ghostButton} onClick={reload} type={'button'}>
                        <RefreshIcon /> Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHead}>
                <div>
                    <h3>Server settings</h3>
                    <p>Curated server.properties options. Unlisted keys are preserved untouched.</p>
                </div>
                <button className={styles.ghostButton} onClick={reload} disabled={saving} type={'button'}>
                    <RefreshIcon /> Reload
                </button>
            </div>

            {SETTING_SECTIONS.map((section) => (
                <div key={section.title}>
                    <h4 className={styles.sectionTitle}>{section.title}</h4>
                    <div className={styles.settingsGrid}>
                        {section.settings.map((def) => (
                            <SettingRow
                                key={def.key}
                                def={def}
                                value={draft[def.key] ?? def.default}
                                present={Object.prototype.hasOwnProperty.call(original, def.key)}
                                onChange={(v) => setValue(def.key, v)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            <div className={styles.saveBar}>
                <span className={dirtyCount > 0 ? styles.dirty : ''}>
                    {dirtyCount > 0 ? `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}` : 'All changes saved'}
                </span>
                <div style={{ display: 'flex', gap: '.6rem' }}>
                    <button className={styles.ghostButton} onClick={reset} disabled={dirtyCount === 0 || saving} type={'button'}>
                        Discard
                    </button>
                    <button className={styles.primaryButton} onClick={save} disabled={dirtyCount === 0 || saving} type={'button'}>
                        <SaveIcon /> {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SettingRowProps {
    def: SettingDefinition;
    value: string;
    present: boolean;
    onChange: (value: string) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ def, value, onChange }) => {
    const control = () => {
        switch (def.type) {
            case 'boolean': {
                const on = value === 'true';
                return (
                    <button
                        type={'button'}
                        role={'switch'}
                        aria-checked={on}
                        aria-label={def.label}
                        className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
                        onClick={() => onChange(on ? 'false' : 'true')}
                    >
                        <span />
                    </button>
                );
            }
            case 'select':
                return (
                    <select value={value} onChange={(e) => onChange(e.currentTarget.value)} aria-label={def.label}>
                        {def.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'number':
                return (
                    <input
                        type={'number'}
                        value={value}
                        min={def.min}
                        max={def.max}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        aria-label={def.label}
                    />
                );
            default:
                return (
                    <input
                        type={'text'}
                        value={value}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        aria-label={def.label}
                    />
                );
        }
    };

    return (
        <div className={styles.setting}>
            <div className={styles.settingInfo}>
                <h4>{def.label}</h4>
                <p>
                    {def.description} <code>{def.key}</code>
                </p>
            </div>
            <div className={styles.settingControl}>{control()}</div>
        </div>
    );
};

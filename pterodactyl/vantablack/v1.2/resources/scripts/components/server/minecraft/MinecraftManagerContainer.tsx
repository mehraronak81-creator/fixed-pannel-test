import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    CubeTransparentIcon,
    UsersIcon,
    AdjustmentsIcon,
    RefreshIcon,
    SearchIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    BanIcon,
    SpeakerphoneIcon,
    SaveIcon,
    ExclamationIcon,
    UserGroupIcon,
    GlobeIcon,
    LightningBoltIcon,
    SunIcon,
    CloudIcon,
    TrashIcon,
    DuplicateIcon,
    CheckIcon,
    XIcon,
    DownloadIcon,
    SparklesIcon,
    HeartIcon,
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
import CopyOnClick from '@/components/elements/CopyOnClick';
import usePlayers, { OnlinePlayer } from './usePlayers';
import { parseProperties, serializeProperties, ParsedProperties } from './properties';
import { SETTING_SECTIONS, SettingDefinition } from './settings';
import styles from './style.module.css';

const PROPERTIES_PATH = '/server.properties';
const USERCACHE_PATH = '/usercache.json';
const OPS_PATH = '/ops.json';
const WHITELIST_PATH = '/whitelist.json';
const BANNED_PLAYERS_PATH = '/banned-players.json';
const BANNED_IPS_PATH = '/banned-ips.json';

type Tab = 'players' | 'whitelist-ops' | 'punishments' | 'world' | 'software' | 'settings';

interface UsercacheEntry {
    name: string;
    uuid: string;
    expiresOn?: string;
}

interface OpEntry {
    uuid: string;
    name: string;
    level?: number;
    bypassesPlayerLimit?: boolean;
}

interface WhitelistEntry {
    uuid: string;
    name: string;
}

interface BannedPlayerEntry {
    uuid?: string;
    name: string;
    created?: string;
    source?: string;
    expires?: string;
    reason?: string;
}

interface BannedIpEntry {
    ip: string;
    created?: string;
    source?: string;
    expires?: string;
    reason?: string;
}

const avatarUrl = (name: string, size = 40): string =>
    `https://mc-heads.net/avatar/${encodeURIComponent(name || 'Steve')}/${size}`;

const GAMEMODES = ['survival', 'creative', 'adventure', 'spectator'];

const AIKAR_FLAGS = `-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:G1InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true`;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('minecraft-manager');
    const { addFlash } = useFlash();
    const flashActions = useRef({ clearFlashes, clearAndAddHttpError, addFlash });
    flashActions.current = { clearFlashes, clearAndAddHttpError, addFlash };

    const isOnline = status === 'running';
    const [canControlConsole] = usePermissions(['control.console']);

    const [tab, setTab] = useState<Tab>('players');

    /* ----------------------------- Live Players & Cache ----------------------------- */
    const { players, refresh } = usePlayers();
    const [playerQuery, setPlayerQuery] = useState('');
    const [broadcast, setBroadcast] = useState('');
    const [broadcastMode, setBroadcastMode] = useState<'chat' | 'title'>('chat');

    const [cachedPlayers, setCachedPlayers] = useState<UsercacheEntry[]>([]);
    const [loadingCache, setLoadingCache] = useState(false);

    // Punish Modal (Kick / Ban with custom reason)
    const [punishModal, setPunishModal] = useState<{ type: 'kick' | 'ban'; name: string } | null>(null);
    const [punishReason, setPunishReason] = useState('');

    const sendCommand = useCallback(
        (command: string) => {
            if (!connected || !instance || !isOnline) return;
            instance.send('send command', command);
        },
        [connected, instance, isOnline]
    );

    const loadUserCache = useCallback(() => {
        setLoadingCache(true);
        getFileContents(uuid, USERCACHE_PATH)
            .then((content) => {
                try {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed)) {
                        setCachedPlayers(parsed);
                    }
                } catch {
                    setCachedPlayers([]);
                }
            })
            .catch(() => setCachedPlayers([]))
            .then(() => setLoadingCache(false));
    }, [uuid]);

    useEffect(() => {
        loadUserCache();
    }, [loadUserCache]);

    const filteredLivePlayers = useMemo(() => {
        const q = playerQuery.trim().toLowerCase();
        if (!q) return players;
        return players.filter((p) => p.name.toLowerCase().includes(q));
    }, [players, playerQuery]);

    const offlineKnownPlayers = useMemo(() => {
        const liveSet = new Set(players.map((p) => p.name.toLowerCase()));
        const q = playerQuery.trim().toLowerCase();
        return cachedPlayers.filter((p) => {
            if (!p.name) return false;
            if (liveSet.has(p.name.toLowerCase())) return false;
            if (q && !p.name.toLowerCase().includes(q) && !(p.uuid || '').toLowerCase().includes(q)) return false;
            return true;
        });
    }, [cachedPlayers, players, playerQuery]);

    const doBroadcast = useCallback(() => {
        const message = broadcast.trim();
        if (!message) return;
        if (broadcastMode === 'title') {
            sendCommand(`title @a title {"text":"${message.replace(/"/g, '\\"')}","color":"green"}`);
        } else {
            sendCommand(`say ${message}`);
        }
        setBroadcast('');
    }, [broadcast, broadcastMode, sendCommand]);

    const confirmPunish = useCallback(() => {
        if (!punishModal) return;
        const reason = punishReason.trim();
        const cmd = punishModal.type === 'ban'
            ? `ban ${punishModal.name}${reason ? ` ${reason}` : ''}`
            : `kick ${punishModal.name}${reason ? ` ${reason}` : ''}`;
        sendCommand(cmd);
        setPunishModal(null);
        setPunishReason('');
    }, [punishModal, punishReason, sendCommand]);

    /* ----------------------------- Whitelist & Ops ----------------------------- */
    const [ops, setOps] = useState<OpEntry[]>([]);
    const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
    const [newOpName, setNewOpName] = useState('');
    const [newOpLevel, setNewOpLevel] = useState('4');
    const [newWhitelistName, setNewWhitelistName] = useState('');
    const [loadingOpsWhitelist, setLoadingOpsWhitelist] = useState(false);

    const loadOpsAndWhitelist = useCallback(() => {
        setLoadingOpsWhitelist(true);
        Promise.all([
            getFileContents(uuid, OPS_PATH).catch(() => '[]'),
            getFileContents(uuid, WHITELIST_PATH).catch(() => '[]'),
        ])
            .then(([opsRaw, wlRaw]) => {
                try {
                    const parsedOps = JSON.parse(opsRaw);
                    setOps(Array.isArray(parsedOps) ? parsedOps : []);
                } catch {
                    setOps([]);
                }
                try {
                    const parsedWl = JSON.parse(wlRaw);
                    setWhitelist(Array.isArray(parsedWl) ? parsedWl : []);
                } catch {
                    setWhitelist([]);
                }
            })
            .then(() => setLoadingOpsWhitelist(false));
    }, [uuid]);

    useEffect(() => {
        if (tab === 'whitelist-ops') {
            loadOpsAndWhitelist();
        }
    }, [tab, loadOpsAndWhitelist]);

    const handleAddOp = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newOpName.trim();
        if (!name) return;
        sendCommand(`op ${name}`);
        setNewOpName('');
        setTimeout(loadOpsAndWhitelist, 1200);
    };

    const handleRemoveOp = (name: string) => {
        sendCommand(`deop ${name}`);
        setTimeout(loadOpsAndWhitelist, 1200);
    };

    const handleAddWhitelist = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newWhitelistName.trim();
        if (!name) return;
        sendCommand(`whitelist add ${name}`);
        setNewWhitelistName('');
        setTimeout(loadOpsAndWhitelist, 1200);
    };

    const handleRemoveWhitelist = (name: string) => {
        sendCommand(`whitelist remove ${name}`);
        setTimeout(loadOpsAndWhitelist, 1200);
    };

    /* ----------------------------- Bans & Punishments ----------------------------- */
    const [bannedPlayers, setBannedPlayers] = useState<BannedPlayerEntry[]>([]);
    const [bannedIps, setBannedIps] = useState<BannedIpEntry[]>([]);
    const [newBanPlayerName, setNewBanPlayerName] = useState('');
    const [newBanPlayerReason, setNewBanPlayerReason] = useState('');
    const [newBanIp, setNewBanIp] = useState('');
    const [newBanIpReason, setNewBanIpReason] = useState('');
    const [loadingBans, setLoadingBans] = useState(false);

    const loadBans = useCallback(() => {
        setLoadingBans(true);
        Promise.all([
            getFileContents(uuid, BANNED_PLAYERS_PATH).catch(() => '[]'),
            getFileContents(uuid, BANNED_IPS_PATH).catch(() => '[]'),
        ])
            .then(([bpRaw, biRaw]) => {
                try {
                    const parsedBp = JSON.parse(bpRaw);
                    setBannedPlayers(Array.isArray(parsedBp) ? parsedBp : []);
                } catch {
                    setBannedPlayers([]);
                }
                try {
                    const parsedBi = JSON.parse(biRaw);
                    setBannedIps(Array.isArray(parsedBi) ? parsedBi : []);
                } catch {
                    setBannedIps([]);
                }
            })
            .then(() => setLoadingBans(false));
    }, [uuid]);

    useEffect(() => {
        if (tab === 'punishments') {
            loadBans();
        }
    }, [tab, loadBans]);

    const handleBanPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newBanPlayerName.trim();
        if (!name) return;
        const reason = newBanPlayerReason.trim();
        sendCommand(`ban ${name}${reason ? ` ${reason}` : ''}`);
        setNewBanPlayerName('');
        setNewBanPlayerReason('');
        setTimeout(loadBans, 1200);
    };

    const handleUnbanPlayer = (name: string) => {
        sendCommand(`pardon ${name}`);
        setTimeout(loadBans, 1200);
    };

    const handleBanIp = (e: React.FormEvent) => {
        e.preventDefault();
        const ip = newBanIp.trim();
        if (!ip) return;
        const reason = newBanIpReason.trim();
        sendCommand(`ban-ip ${ip}${reason ? ` ${reason}` : ''}`);
        setNewBanIp('');
        setNewBanIpReason('');
        setTimeout(loadBans, 1200);
    };

    const handleUnbanIp = (ip: string) => {
        sendCommand(`pardon-ip ${ip}`);
        setTimeout(loadBans, 1200);
    };

    /* ----------------------------- Version & JVM Software ----------------------------- */
    const [softwareType, setSoftwareType] = useState<'paper' | 'purpur' | 'vanilla'>('paper');
    const [selectedVersion, setSelectedVersion] = useState('1.21.4');
    const [copiedFlags, setCopiedFlags] = useState(false);

    const versionDownloadUrl = useMemo(() => {
        if (softwareType === 'purpur') {
            return `https://api.purpurmc.org/v2/purpur/${selectedVersion}/latest/download`;
        }
        if (softwareType === 'paper') {
            return `https://api.papermc.io/v2/projects/paper/versions/${selectedVersion}`;
        }
        return `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`;
    }, [softwareType, selectedVersion]);

    /* ----------------------------- Settings (server.properties) ----------------------------- */
    const [parsed, setParsed] = useState<ParsedProperties | null>(null);
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [loadingProps, setLoadingProps] = useState(true);
    const [propsMissing, setPropsMissing] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadProperties = useCallback(() => {
        setLoadingProps(true);
        setPropsMissing(false);
        flashActions.current.clearFlashes();

        getFileContents(uuid, PROPERTIES_PATH)
            .then((content) => {
                const next = parseProperties(content);
                setParsed(next);
                setDraft(next.values);
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setPropsMissing(true);
                    setParsed(null);
                } else {
                    flashActions.current.clearAndAddHttpError(error);
                }
            })
            .then(() => setLoadingProps(false));
    }, [uuid]);

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

    const opNameSet = useMemo(() => new Set(ops.map((o) => o.name.toLowerCase())), [ops]);

    return (
        <ServerContentBlock title={'Minecraft'} icon={CubeTransparentIcon}>
            <div className={styles.page}>
                <FlashMessageRender byKey={'minecraft-manager'} />

                {/* Hero Header */}
                <div className={styles.hero}>
                    <div>
                        <span className={styles.eyebrow}>Minecraft Suite</span>
                        <h2>Server Management Console</h2>
                        <p>
                            Real-time player monitoring, whitelist & OP control, ban enforcement, instant gamerules,
                            software upgrades, and visual <code>server.properties</code> configuration.
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

                {/* Navigation Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === 'players' ? styles.tabActive : ''}`}
                        onClick={() => setTab('players')}
                        type={'button'}
                    >
                        <UsersIcon /> Players
                        {players.length > 0 ? ` (${players.length})` : ''}
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'whitelist-ops' ? styles.tabActive : ''}`}
                        onClick={() => setTab('whitelist-ops')}
                        type={'button'}
                    >
                        <ShieldCheckIcon /> Whitelist & OPs
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'punishments' ? styles.tabActive : ''}`}
                        onClick={() => setTab('punishments')}
                        type={'button'}
                    >
                        <BanIcon /> Bans & Punishments
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'world' ? styles.tabActive : ''}`}
                        onClick={() => setTab('world')}
                        type={'button'}
                    >
                        <GlobeIcon /> World & Gamerules
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'software' ? styles.tabActive : ''}`}
                        onClick={() => setTab('software')}
                        type={'button'}
                    >
                        <LightningBoltIcon /> Software & JVM Flags
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'settings' ? styles.tabActive : ''}`}
                        onClick={() => setTab('settings')}
                        type={'button'}
                    >
                        <AdjustmentsIcon /> server.properties
                    </button>
                </div>

                {/* Kick / Ban Reason Modal */}
                {punishModal && (
                    <div className={'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md'}>
                        <div className={'liquid-glass p-6 max-w-md w-full border border-red-500/30 rounded-2xl shadow-2xl relative'}>
                            <div className={'flex items-center gap-3 mb-4'}>
                                <div className={'p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400'}>
                                    <BanIcon className={'w-6 h-6'} />
                                </div>
                                <div>
                                    <h3 className={'text-base font-bold text-white uppercase tracking-wider'}>
                                        {punishModal.type === 'ban' ? 'Ban Player' : 'Kick Player'}
                                    </h3>
                                    <p className={'text-xs text-neutral-400'}>
                                        Target:&nbsp;
                                        <strong className={'text-emerald-400'}>{punishModal.name}</strong>
                                    </p>
                                </div>
                            </div>

                            <div className={'mb-4'}>
                                <label className={'block text-xs font-semibold text-neutral-300 mb-1'}>
                                    Reason <span className={'text-neutral-500'}>(Optional)</span>
                                </label>
                                <input
                                    type={'text'}
                                    value={punishReason}
                                    onChange={(e) => setPunishReason(e.target.value)}
                                    placeholder={'e.g. Griefing, Inappropriate behavior, Spamming'}
                                    className={'w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-sm outline-none focus:border-red-500'}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmPunish()}
                                />
                            </div>

                            <div className={'flex justify-end gap-2'}>
                                <button
                                    type={'button'}
                                    onClick={() => setPunishModal(null)}
                                    className={'px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-medium cursor-pointer'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type={'button'}
                                    onClick={confirmPunish}
                                    className={'px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer'}
                                >
                                    Confirm {punishModal.type === 'ban' ? 'Ban' : 'Kick'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 1: PLAYERS (LIVE & KNOWN) */}
                {tab === 'players' && (
                    <div className={styles.panel}>
                        <div className={styles.panelHead}>
                            <div>
                                <h3>Online Players</h3>
                                <p>Live players detected from console. 1-click actions run immediately.</p>
                            </div>
                            <button
                                className={styles.ghostButton}
                                onClick={() => {
                                    refresh();
                                    loadUserCache();
                                }}
                                disabled={!isOnline}
                                type={'button'}
                            >
                                <RefreshIcon /> Refresh
                            </button>
                        </div>

                        {!isOnline && (
                            <div className={styles.offlineNote}>
                                <ExclamationIcon />
                                The server is currently offline. Start it to query live online players and execute console commands.
                            </div>
                        )}

                        <div className={styles.playerBar}>
                            <div className={styles.searchField}>
                                <SearchIcon />
                                <input
                                    value={playerQuery}
                                    onChange={(e) => setPlayerQuery(e.currentTarget.value)}
                                    placeholder={'Filter online & known players…'}
                                    aria-label={'Filter players'}
                                />
                            </div>
                        </div>

                        {/* Live Players Grid */}
                        {filteredLivePlayers.length === 0 ? (
                            <div className={styles.emptyState}>
                                <UserGroupIcon />
                                <h4>{players.length === 0 ? 'No players online' : 'No players match your search'}</h4>
                                <p>
                                    {players.length === 0
                                        ? isOnline
                                            ? 'When players connect, they will appear here automatically.'
                                            : 'Start the server to track player activity.'
                                        : 'Try a different username filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.playerList}>
                                {filteredLivePlayers.map((player) => {
                                    const isOp = opNameSet.has(player.name.toLowerCase());
                                    return (
                                        <div key={player.name} className={styles.playerCard}>
                                            <div className={styles.playerTop}>
                                                <img
                                                    className={styles.avatar}
                                                    src={avatarUrl(player.name, 48)}
                                                    alt={player.name}
                                                    loading={'lazy'}
                                                />
                                                <div className={'min-w-0'}>
                                                    <p className={styles.playerName}>{player.name}</p>
                                                    <div className={'flex items-center gap-1.5 mt-0.5'}>
                                                        <span className={'inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />
                                                        <span className={'text-xs text-emerald-400 font-semibold'}>Online</span>
                                                        {isOp && (
                                                            <span className={'px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold ml-1'}>
                                                                OP
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.actions}>
                                                {/* OP / De-OP */}
                                                {isOp ? (
                                                    <button
                                                        onClick={() => sendCommand(`deop ${player.name}`)}
                                                        disabled={!isOnline || !canControlConsole}
                                                        type={'button'}
                                                        title={'Remove Operator status'}
                                                    >
                                                        <ShieldExclamationIcon className={'w-3.5 h-3.5 text-amber-400'} /> De-op
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={styles.actionOp}
                                                        onClick={() => sendCommand(`op ${player.name}`)}
                                                        disabled={!isOnline || !canControlConsole}
                                                        type={'button'}
                                                        title={'Grant Operator status'}
                                                    >
                                                        <ShieldCheckIcon className={'w-3.5 h-3.5'} /> OP
                                                    </button>
                                                )}

                                                {/* Gamemode Dropdown */}
                                                <select
                                                    onChange={(e) => {
                                                        if (e.currentTarget.value) {
                                                            sendCommand(`gamemode ${e.currentTarget.value} ${player.name}`);
                                                            e.currentTarget.value = '';
                                                        }
                                                    }}
                                                    disabled={!isOnline || !canControlConsole}
                                                    defaultValue={''}
                                                    aria-label={`Set gamemode for ${player.name}`}
                                                    style={{
                                                        backgroundColor: 'rgba(10, 10, 14, 0.9)',
                                                        color: '#e5e5e5',
                                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        outline: 'none',
                                                    }}
                                                >
                                                    <option value={''} disabled style={{ backgroundColor: '#0a0a0e', color: '#888888' }}>
                                                        Gamemode…
                                                    </option>
                                                    {GAMEMODES.map((mode) => (
                                                        <option key={mode} value={mode} style={{ backgroundColor: '#0a0a0e', color: '#e5e5e5' }}>
                                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Heal & Feed */}
                                                <button
                                                    onClick={() => {
                                                        sendCommand(`effect give ${player.name} minecraft:instant_health 1 10`);
                                                        sendCommand(`effect give ${player.name} minecraft:saturation 1 10`);
                                                    }}
                                                    disabled={!isOnline || !canControlConsole}
                                                    type={'button'}
                                                    title={'Heal and saturate player hunger'}
                                                >
                                                    <HeartIcon className={'w-3.5 h-3.5 text-rose-400'} /> Heal & Feed
                                                </button>

                                                {/* Clear Inventory */}
                                                <button
                                                    onClick={() => sendCommand(`clear ${player.name}`)}
                                                    disabled={!isOnline || !canControlConsole}
                                                    type={'button'}
                                                    title={'Clear player inventory'}
                                                >
                                                    <TrashIcon className={'w-3.5 h-3.5 text-neutral-400'} /> Clear Inv
                                                </button>

                                                {/* Kill */}
                                                <button
                                                    onClick={() => sendCommand(`kill ${player.name}`)}
                                                    disabled={!isOnline || !canControlConsole}
                                                    type={'button'}
                                                    title={'Kill player'}
                                                >
                                                    Kill
                                                </button>

                                                {/* Kick */}
                                                <button
                                                    className={styles.actionKick}
                                                    onClick={() => setPunishModal({ type: 'kick', name: player.name })}
                                                    disabled={!isOnline || !canControlConsole}
                                                    type={'button'}
                                                >
                                                    Kick
                                                </button>

                                                {/* Ban */}
                                                <button
                                                    className={styles.actionBan}
                                                    onClick={() => setPunishModal({ type: 'ban', name: player.name })}
                                                    disabled={!isOnline || !canControlConsole}
                                                    type={'button'}
                                                >
                                                    <BanIcon className={'w-3.5 h-3.5'} /> Ban
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Recent / Known Players (usercache.json) */}
                        <div className={'mt-8 pt-6 border-t border-white/10'}>
                            <div className={'flex items-center justify-between mb-4'}>
                                <div>
                                    <h4 className={'text-base font-bold text-white flex items-center gap-2'}>
                                        <UsersIcon className={'w-4 h-4 text-emerald-400'} />
                                        Recent & Known Players (usercache.json)
                                    </h4>
                                    <p className={'text-xs text-neutral-400'}>
                                        Players recorded in your server cache. You can OP, Whitelist, or Ban players even when they are offline.
                                    </p>
                                </div>
                                <span className={'px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300'}>
                                    {offlineKnownPlayers.length} offline {offlineKnownPlayers.length === 1 ? 'player' : 'players'}
                                </span>
                            </div>

                            {loadingCache ? (
                                <div className={'py-6 text-center text-xs text-neutral-500'}>Loading usercache.json…</div>
                            ) : offlineKnownPlayers.length === 0 ? (
                                <p className={'text-xs text-neutral-500 italic'}>
                                    {cachedPlayers.length === 0
                                        ? 'No players recorded in usercache.json yet.'
                                        : 'All known players are currently online or filtered out.'}
                                </p>
                            ) : (
                                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'}>
                                    {offlineKnownPlayers.slice(0, 15).map((player) => (
                                        <div
                                            key={player.uuid || player.name}
                                            className={'liquid-glass p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3'}
                                        >
                                            <div className={'flex items-center gap-2.5 min-w-0'}>
                                                <img
                                                    className={'w-8 h-8 rounded-lg shrink-0 pixelated bg-black/40'}
                                                    src={avatarUrl(player.name, 40)}
                                                    alt={player.name}
                                                />
                                                <div className={'min-w-0'}>
                                                    <p className={'text-sm font-semibold text-white truncate'}>{player.name}</p>
                                                    <p className={'text-[10px] text-neutral-500 font-mono truncate'}>
                                                        {player.uuid ? `${player.uuid.slice(0, 8)}…` : 'Offline'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={'flex items-center gap-1.5 shrink-0'}>
                                                <button
                                                    onClick={() => sendCommand(`op ${player.name}`)}
                                                    disabled={!isOnline || !canControlConsole}
                                                    className={'p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 cursor-pointer disabled:opacity-50'}
                                                    title={`OP ${player.name}`}
                                                >
                                                    OP
                                                </button>
                                                <button
                                                    onClick={() => sendCommand(`whitelist add ${player.name}`)}
                                                    disabled={!isOnline || !canControlConsole}
                                                    className={'p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 cursor-pointer disabled:opacity-50'}
                                                    title={`Whitelist ${player.name}`}
                                                >
                                                    Whitelist
                                                </button>
                                                <button
                                                    onClick={() => setPunishModal({ type: 'ban', name: player.name })}
                                                    disabled={!isOnline || !canControlConsole}
                                                    className={'p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 cursor-pointer disabled:opacity-50'}
                                                    title={`Ban ${player.name}`}
                                                >
                                                    Ban
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Broadcast Bar */}
                        <Can action={'control.console'}>
                            <div className={'mt-8 pt-4 border-t border-white/10'}>
                                <div className={'flex items-center gap-3 mb-2'}>
                                    <span className={'text-xs font-semibold text-neutral-300'}>Broadcast Target:</span>
                                    <button
                                        type={'button'}
                                        onClick={() => setBroadcastMode('chat')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            broadcastMode === 'chat'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Chat (say)
                                    </button>
                                    <button
                                        type={'button'}
                                        onClick={() => setBroadcastMode('title')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            broadcastMode === 'title'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Screen Title (@a title)
                                    </button>
                                </div>
                                <div className={styles.broadcast}>
                                    <input
                                        value={broadcast}
                                        onChange={(e) => setBroadcast(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && doBroadcast()}
                                        placeholder={
                                            broadcastMode === 'title'
                                                ? 'Broadcast big screen title announcement…'
                                                : 'Broadcast chat message to everyone…'
                                        }
                                        disabled={!isOnline}
                                        aria-label={'Broadcast message'}
                                    />
                                    <button
                                        className={styles.primaryButton}
                                        onClick={doBroadcast}
                                        disabled={!isOnline || !broadcast.trim()}
                                        type={'button'}
                                    >
                                        <SpeakerphoneIcon /> Send Announcement
                                    </button>
                                </div>
                            </div>
                        </Can>
                    </div>
                )}

                {/* TAB 2: WHITELIST & OPS */}
                {tab === 'whitelist-ops' && (
                    <div className={styles.twoCol}>
                        {/* Operators Panel */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <ShieldCheckIcon /> Server Operators (ops.json)
                                </h4>
                                <button
                                    className={styles.ghostButton}
                                    onClick={loadOpsAndWhitelist}
                                    type={'button'}
                                    title={'Reload ops.json'}
                                >
                                    <RefreshIcon />
                                </button>
                            </div>

                            <form onSubmit={handleAddOp} className={styles.formRow}>
                                <input
                                    type={'text'}
                                    value={newOpName}
                                    onChange={(e) => setNewOpName(e.target.value)}
                                    placeholder={'Minecraft username to OP…'}
                                />
                                <button className={styles.btnSm} type={'submit'} disabled={!isOnline || !newOpName.trim()}>
                                    Add OP
                                </button>
                            </form>

                            {loadingOpsWhitelist ? (
                                <p className={'text-xs text-neutral-500'}>Loading operators…</p>
                            ) : ops.length === 0 ? (
                                <p className={'text-xs text-neutral-500 italic'}>No operators found in ops.json.</p>
                            ) : (
                                <div className={'space-y-2 max-h-96 overflow-y-auto pr-1'}>
                                    {ops.map((op) => (
                                        <div key={op.uuid || op.name} className={styles.itemRow}>
                                            <div className={'flex items-center gap-3 min-w-0'}>
                                                <img
                                                    className={'w-8 h-8 rounded-lg pixelated bg-black/40'}
                                                    src={avatarUrl(op.name, 36)}
                                                    alt={op.name}
                                                />
                                                <div className={'min-w-0'}>
                                                    <p className={'text-sm font-semibold text-white truncate'}>{op.name}</p>
                                                    <span className={'px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-bold'}>
                                                        Level {op.level ?? 4}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className={styles.btnDangerSm}
                                                onClick={() => handleRemoveOp(op.name)}
                                                disabled={!isOnline}
                                                type={'button'}
                                            >
                                                Remove OP
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Whitelist Panel */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <ShieldCheckIcon /> Whitelist (whitelist.json)
                                </h4>
                                <div className={'flex items-center gap-2'}>
                                    <button
                                        className={styles.ghostButton}
                                        onClick={() => sendCommand('whitelist reload')}
                                        disabled={!isOnline}
                                        type={'button'}
                                        title={'Reload whitelist in game'}
                                    >
                                        Reload Whitelist
                                    </button>
                                </div>
                            </div>

                            <div className={'flex items-center justify-between mb-4 p-3 rounded-xl bg-white/5 border border-white/5'}>
                                <div>
                                    <p className={'text-xs font-semibold text-white'}>Enforce Whitelist</p>
                                    <p className={'text-[11px] text-neutral-400'}>Only whitelisted players can join.</p>
                                </div>
                                <div className={'flex gap-2'}>
                                    <button
                                        className={'px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer'}
                                        onClick={() => sendCommand('whitelist on')}
                                        disabled={!isOnline}
                                        type={'button'}
                                    >
                                        Enable
                                    </button>
                                    <button
                                        className={'px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 cursor-pointer'}
                                        onClick={() => sendCommand('whitelist off')}
                                        disabled={!isOnline}
                                        type={'button'}
                                    >
                                        Disable
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleAddWhitelist} className={styles.formRow}>
                                <input
                                    type={'text'}
                                    value={newWhitelistName}
                                    onChange={(e) => setNewWhitelistName(e.target.value)}
                                    placeholder={'Username to whitelist…'}
                                />
                                <button
                                    className={styles.btnSm}
                                    type={'submit'}
                                    disabled={!isOnline || !newWhitelistName.trim()}
                                >
                                    Add to Whitelist
                                </button>
                            </form>

                            {loadingOpsWhitelist ? (
                                <p className={'text-xs text-neutral-500'}>Loading whitelist…</p>
                            ) : whitelist.length === 0 ? (
                                <p className={'text-xs text-neutral-500 italic'}>No players on the whitelist.</p>
                            ) : (
                                <div className={'space-y-2 max-h-96 overflow-y-auto pr-1'}>
                                    {whitelist.map((wl) => (
                                        <div key={wl.uuid || wl.name} className={styles.itemRow}>
                                            <div className={'flex items-center gap-3 min-w-0'}>
                                                <img
                                                    className={'w-8 h-8 rounded-lg pixelated bg-black/40'}
                                                    src={avatarUrl(wl.name, 36)}
                                                    alt={wl.name}
                                                />
                                                <p className={'text-sm font-semibold text-white truncate'}>{wl.name}</p>
                                            </div>
                                            <button
                                                className={styles.btnDangerSm}
                                                onClick={() => handleRemoveWhitelist(wl.name)}
                                                disabled={!isOnline}
                                                type={'button'}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: BANS & PUNISHMENTS */}
                {tab === 'punishments' && (
                    <div className={styles.twoCol}>
                        {/* Banned Players */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <BanIcon /> Banned Players (banned-players.json)
                                </h4>
                                <button className={styles.ghostButton} onClick={loadBans} type={'button'}>
                                    <RefreshIcon />
                                </button>
                            </div>

                            <form onSubmit={handleBanPlayer} className={'space-y-2 mb-4'}>
                                <div className={'flex gap-2'}>
                                    <input
                                        className={'flex-1 h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none'}
                                        type={'text'}
                                        value={newBanPlayerName}
                                        onChange={(e) => setNewBanPlayerName(e.target.value)}
                                        placeholder={'Username to ban…'}
                                    />
                                    <button
                                        className={styles.btnDangerSm}
                                        type={'submit'}
                                        disabled={!isOnline || !newBanPlayerName.trim()}
                                    >
                                        Ban Player
                                    </button>
                                </div>
                                <input
                                    className={'w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none'}
                                    type={'text'}
                                    value={newBanPlayerReason}
                                    onChange={(e) => setNewBanPlayerReason(e.target.value)}
                                    placeholder={'Ban reason (optional)…'}
                                />
                            </form>

                            {loadingBans ? (
                                <p className={'text-xs text-neutral-500'}>Loading banned players…</p>
                            ) : bannedPlayers.length === 0 ? (
                                <p className={'text-xs text-neutral-500 italic'}>No players are currently banned.</p>
                            ) : (
                                <div className={'space-y-2 max-h-96 overflow-y-auto pr-1'}>
                                    {bannedPlayers.map((bp) => (
                                        <div key={bp.uuid || bp.name} className={styles.itemRow}>
                                            <div className={'flex items-start gap-3 min-w-0'}>
                                                <img
                                                    className={'w-8 h-8 rounded-lg pixelated bg-black/40 shrink-0 mt-0.5'}
                                                    src={avatarUrl(bp.name, 36)}
                                                    alt={bp.name}
                                                />
                                                <div className={'min-w-0'}>
                                                    <p className={'text-sm font-semibold text-white truncate'}>{bp.name}</p>
                                                    <p className={'text-xs text-red-400 truncate'}>
                                                        {bp.reason || 'Banned by operator'}
                                                    </p>
                                                    {bp.source && (
                                                        <p className={'text-[10px] text-neutral-500'}>By: {bp.source}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className={styles.btnSm}
                                                onClick={() => handleUnbanPlayer(bp.name)}
                                                disabled={!isOnline}
                                                type={'button'}
                                            >
                                                Unban
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Banned IPs */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <BanIcon /> Banned IPs (banned-ips.json)
                                </h4>
                                <button className={styles.ghostButton} onClick={loadBans} type={'button'}>
                                    <RefreshIcon />
                                </button>
                            </div>

                            <form onSubmit={handleBanIp} className={'space-y-2 mb-4'}>
                                <div className={'flex gap-2'}>
                                    <input
                                        className={'flex-1 h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none'}
                                        type={'text'}
                                        value={newBanIp}
                                        onChange={(e) => setNewBanIp(e.target.value)}
                                        placeholder={'IP address to ban (e.g. 1.2.3.4)…'}
                                    />
                                    <button
                                        className={styles.btnDangerSm}
                                        type={'submit'}
                                        disabled={!isOnline || !newBanIp.trim()}
                                    >
                                        Ban IP
                                    </button>
                                </div>
                                <input
                                    className={'w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none'}
                                    type={'text'}
                                    value={newBanIpReason}
                                    onChange={(e) => setNewBanIpReason(e.target.value)}
                                    placeholder={'IP ban reason (optional)…'}
                                />
                            </form>

                            {loadingBans ? (
                                <p className={'text-xs text-neutral-500'}>Loading banned IPs…</p>
                            ) : bannedIps.length === 0 ? (
                                <p className={'text-xs text-neutral-500 italic'}>No IP addresses are currently banned.</p>
                            ) : (
                                <div className={'space-y-2 max-h-96 overflow-y-auto pr-1'}>
                                    {bannedIps.map((bi) => (
                                        <div key={bi.ip} className={styles.itemRow}>
                                            <div className={'min-w-0'}>
                                                <p className={'text-sm font-mono font-semibold text-white truncate'}>
                                                    {bi.ip}
                                                </p>
                                                <p className={'text-xs text-red-400 truncate'}>
                                                    {bi.reason || 'IP banned'}
                                                </p>
                                            </div>
                                            <button
                                                className={styles.btnSm}
                                                onClick={() => handleUnbanIp(bi.ip)}
                                                disabled={!isOnline}
                                                type={'button'}
                                            >
                                                Unban IP
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: WORLD & GAMERULES */}
                {tab === 'world' && (
                    <div className={'space-y-6'}>
                        {/* Quick Environment Controls */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <SunIcon /> Environment Controls (Instant Live Console)
                                </h4>
                            </div>

                            <div className={'grid grid-cols-1 md:grid-cols-3 gap-4'}>
                                {/* Time Controls */}
                                <div className={'p-3 rounded-xl bg-white/5 border border-white/5'}>
                                    <p className={'text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                                        <SunIcon className={'w-4 h-4 text-amber-400'} /> Time of Day
                                    </p>
                                    <div className={'grid grid-cols-2 gap-2'}>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('time set day')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                        >
                                            ☀️ Day (1000)
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('time set 6000')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                        >
                                            🌤️ Noon (6000)
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('time set 12000')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                        >
                                            🌅 Sunset (12000)
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('time set midnight')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-indigo-500/20 hover:border-indigo-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                        >
                                            🌙 Midnight (18000)
                                        </button>
                                    </div>
                                </div>

                                {/* Weather Controls */}
                                <div className={'p-3 rounded-xl bg-white/5 border border-white/5'}>
                                    <p className={'text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                                        <CloudIcon className={'w-4 h-4 text-cyan-400'} /> Weather State
                                    </p>
                                    <div className={'grid grid-cols-1 gap-2'}>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('weather clear')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between'}
                                        >
                                            <span>☀️ Clear Sky</span>
                                            <span className={'text-[10px] text-neutral-500'}>weather clear</span>
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('weather rain')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-blue-500/20 hover:border-blue-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between'}
                                        >
                                            <span>🌧️ Rain</span>
                                            <span className={'text-[10px] text-neutral-500'}>weather rain</span>
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('weather thunder')}
                                            disabled={!isOnline}
                                            className={'p-2 rounded-lg bg-black/40 hover:bg-purple-500/20 hover:border-purple-500/40 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between'}
                                        >
                                            <span>⛈️ Thunderstorm</span>
                                            <span className={'text-[10px] text-neutral-500'}>weather thunder</span>
                                        </button>
                                    </div>
                                </div>

                                {/* World Actions */}
                                <div className={'p-3 rounded-xl bg-white/5 border border-white/5'}>
                                    <p className={'text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                                        <SaveIcon className={'w-4 h-4 text-emerald-400'} /> World Save & Sync
                                    </p>
                                    <div className={'space-y-2'}>
                                        <button
                                            type={'button'}
                                            onClick={() => sendCommand('save-all')}
                                            disabled={!isOnline}
                                            className={'w-full p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs text-emerald-300 font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5'}
                                        >
                                            <SaveIcon className={'w-4 h-4'} /> Save World Now (save-all)
                                        </button>
                                        <div className={'grid grid-cols-2 gap-2'}>
                                            <button
                                                type={'button'}
                                                onClick={() => sendCommand('save-on')}
                                                disabled={!isOnline}
                                                className={'p-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                            >
                                                Auto-Save ON
                                            </button>
                                            <button
                                                type={'button'}
                                                onClick={() => sendCommand('save-off')}
                                                disabled={!isOnline}
                                                className={'p-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/5 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-50'}
                                            >
                                                Auto-Save OFF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1-Click Interactive Gamerules Grid */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <SparklesIcon /> 1-Click Interactive Gamerules
                                </h4>
                                <span className={'text-xs text-neutral-400'}>
                                    Commands execute immediately on the live server.
                                </span>
                            </div>

                            <div className={styles.gameruleGrid}>
                                {[
                                    { key: 'keepInventory', title: 'Keep Inventory', desc: 'Preserve items & XP upon player death' },
                                    { key: 'mobGriefing', title: 'Mob Griefing', desc: 'Creepers & Endermen modify world blocks' },
                                    { key: 'doDaylightCycle', title: 'Daylight Cycle', desc: 'Progression of day and night' },
                                    { key: 'doWeatherCycle', title: 'Weather Cycle', desc: 'Dynamic rain and storm changes' },
                                    { key: 'doImmediateRespawn', title: 'Instant Respawn', desc: 'Respawn immediately without death screen' },
                                    { key: 'pvp', title: 'PvP Damage', desc: 'Allow players to damage each other' },
                                    { key: 'fallDamage', title: 'Fall Damage', desc: 'Players receive damage from heights' },
                                    { key: 'doFireTick', title: 'Fire Spread', desc: 'Fire propagates to adjacent flammable blocks' },
                                    { key: 'showDeathMessages', title: 'Death Messages', desc: 'Broadcast player deaths in chat' },
                                    { key: 'naturalRegeneration', title: 'Natural Health Regen', desc: 'Regenerate hearts when hunger is full' },
                                    { key: 'doTileDrops', title: 'Block Drops', desc: 'Mined blocks drop corresponding items' },
                                ].map((rule) => (
                                    <div key={rule.key} className={styles.gameruleCard}>
                                        <div>
                                            <h5>{rule.title}</h5>
                                            <p>{rule.desc}</p>
                                        </div>
                                        <div className={'flex gap-1.5 shrink-0'}>
                                            <button
                                                type={'button'}
                                                onClick={() => sendCommand(`gamerule ${rule.key} true`)}
                                                disabled={!isOnline}
                                                className={'px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer disabled:opacity-50'}
                                            >
                                                True
                                            </button>
                                            <button
                                                type={'button'}
                                                onClick={() => sendCommand(`gamerule ${rule.key} false`)}
                                                disabled={!isOnline}
                                                className={'px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 cursor-pointer disabled:opacity-50'}
                                            >
                                                False
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* 1-Player Sleep Helper */}
                                <div className={styles.gameruleCard}>
                                    <div>
                                        <h5>1-Player Sleep</h5>
                                        <p>Passing night only requires 1 player in bed</p>
                                    </div>
                                    <button
                                        type={'button'}
                                        onClick={() => sendCommand('gamerule playersSleepingPercentage 1')}
                                        disabled={!isOnline}
                                        className={'px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 cursor-pointer disabled:opacity-50 shrink-0'}
                                    >
                                        Set to 1%
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: SOFTWARE & JVM FLAGS */}
                {tab === 'software' && (
                    <div className={'space-y-6'}>
                        {/* 1-Click Version Downloader */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <DownloadIcon /> Server Software & Version Downloader
                                </h4>
                            </div>

                            <div className={'space-y-4'}>
                                <div>
                                    <label className={'block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2'}>
                                        Select Server Software:
                                    </label>
                                    <div className={'flex flex-wrap gap-2'}>
                                        {(['paper', 'purpur', 'vanilla'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type={'button'}
                                                onClick={() => setSoftwareType(type)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    softwareType === type
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                                                        : 'bg-black/40 text-neutral-400 border border-white/5 hover:text-white'
                                                }`}
                                            >
                                                {type === 'paper' ? '📄 PaperMC (Fast & Recommended)' : type === 'purpur' ? '⚡ Purpur (Ultra-Optimized)' : '📦 Vanilla'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={'block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2'}>
                                        Select Minecraft Version:
                                    </label>
                                    <div className={'flex flex-wrap gap-2'}>
                                        {['1.21.4', '1.21.1', '1.20.4', '1.19.4', '1.16.5', '1.8.8'].map((ver) => (
                                            <button
                                                key={ver}
                                                type={'button'}
                                                onClick={() => setSelectedVersion(ver)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    selectedVersion === ver
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                        : 'bg-black/40 text-neutral-400 border border-white/5 hover:text-white'
                                                }`}
                                            >
                                                {ver}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={'p-4 rounded-xl bg-black/60 border border-white/10'}>
                                    <p className={'text-xs font-semibold text-neutral-300 mb-1'}>
                                        Direct API Endpoint:
                                    </p>
                                    <code className={'block font-mono text-xs text-emerald-400 break-all mb-3'}>
                                        {versionDownloadUrl}
                                    </code>
                                    <div className={'flex flex-wrap items-center gap-2'}>
                                        <a
                                            href={versionDownloadUrl}
                                            target={'_blank'}
                                            rel={'noreferrer'}
                                            className={'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md'}
                                        >
                                            <DownloadIcon className={'w-4 h-4'} /> Download {softwareType.toUpperCase()} {selectedVersion} JAR
                                        </a>
                                        <CopyOnClick text={`curl -o server.jar "${versionDownloadUrl}"`}>
                                            <button
                                                type={'button'}
                                                className={'px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer'}
                                            >
                                                <DuplicateIcon className={'w-4 h-4'} /> Copy curl command
                                            </button>
                                        </CopyOnClick>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aikar's JVM Flags */}
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <h4>
                                    <LightningBoltIcon /> Aikar's Optimized JVM Flags
                                </h4>
                                <CopyOnClick text={AIKAR_FLAGS}>
                                    <button
                                        type={'button'}
                                        onClick={() => {
                                            setCopiedFlags(true);
                                            setTimeout(() => setCopiedFlags(false), 2000);
                                        }}
                                        className={'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md'}
                                    >
                                        {copiedFlags ? <CheckIcon className={'w-4 h-4'} /> : <DuplicateIcon className={'w-4 h-4'} />}
                                        {copiedFlags ? 'Copied Flags!' : "Copy Aikar's Flags"}
                                    </button>
                                </CopyOnClick>
                            </div>

                            <p className={'text-xs text-neutral-400 mb-3 leading-relaxed'}>
                                Aikar&apos;s JVM flags tune the G1 Garbage Collector specifically for Minecraft server workloads to eliminate GC pauses, stuttering, and tick lag. Paste these into your <strong>Startup &gt; Additional Java Arguments</strong>.
                            </p>

                            <div className={'p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-neutral-300 break-all select-all leading-relaxed'}>
                                {AIKAR_FLAGS}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: SETTINGS (server.properties) */}
                {tab === 'settings' && (
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

/* ============================== Settings Panel ============================== */

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
                    <h3>server.properties Visual Editor</h3>
                    <p>Curated server.properties options. Custom and unlisted keys are preserved untouched.</p>
                </div>
                <button className={styles.ghostButton} onClick={reload} disabled={saving} type={'button'}>
                    <RefreshIcon /> Reload
                </button>
            </div>

            {/* MOTD Live Preview Banner if motd exists */}
            {draft.motd !== undefined && (
                <div className={'mb-6 p-4 rounded-xl bg-black/80 border border-white/10'}>
                    <div className={'flex items-center justify-between mb-2'}>
                        <span className={'text-xs font-bold text-neutral-400 uppercase tracking-wider'}>
                            Multiplayer Server List MOTD Preview
                        </span>
                        <span className={'text-[10px] text-neutral-500'}>Live Simulation</span>
                    </div>
                    <div className={'p-3 rounded-lg bg-[#0d0d0d] border border-white/5 font-mono text-sm leading-snug flex items-center gap-3'}>
                        <div className={'w-12 h-12 rounded bg-black/60 flex items-center justify-center shrink-0 border border-white/10'}>
                            <CubeTransparentIcon className={'w-8 h-8 text-emerald-400'} />
                        </div>
                        <div className={'min-w-0'}>
                            <p className={'text-white font-bold text-sm truncate'}>Minecraft Server</p>
                            <p className={'text-neutral-300 text-xs font-normal'}>
                                {draft.motd.replace(/§[0-9a-fk-orx]/gi, '') || 'A Minecraft Server'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                    <button
                        className={styles.ghostButton}
                        onClick={reset}
                        disabled={dirtyCount === 0 || saving}
                        type={'button'}
                    >
                        Discard
                    </button>
                    <button
                        className={styles.primaryButton}
                        onClick={save}
                        disabled={dirtyCount === 0 || saving}
                        type={'button'}
                    >
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

import React, { useState, useEffect, useMemo } from 'react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import { ip } from '@/lib/formatters';
import CopyOnClick from '@/components/elements/CopyOnClick';
import {
    VolumeUpIcon,
    ServerIcon,
    EyeIcon,
    EyeOffIcon,
    ClipboardCopyIcon,
    TerminalIcon,
    ChartBarIcon,
    KeyIcon,
    CogIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    FastForwardIcon,
    TrashIcon,
    ShieldExclamationIcon,
    CheckCircleIcon,
    WifiIcon,
    UserGroupIcon,
    RefreshIcon,
} from '@heroicons/react/outline';

interface PlayingTrack {
    id: string;
    guildId: string;
    guildName: string;
    trackTitle: string;
    artist: string;
    source: 'YouTube' | 'Spotify' | 'JioSaavn';
    thumbnailUrl: string;
    positionSec: number;
    durationSec: number;
    state: 'playing' | 'paused';
    clientTag: string;
    volume: number;
    pingMs: number;
}

interface ConnectedBot {
    id: string;
    clientTag: string;
    ipAddress: string;
    botId: string;
    playersCount: number;
    connectedSince: string;
}

interface BanEntry {
    id: string;
    ipOrBotId: string;
    reason: string;
    bannedAt: string;
}

const INITIAL_TRACKS: PlayingTrack[] = [
    {
        id: 'tr-1',
        guildId: '109283746501928374',
        guildName: 'CyberVibe Community',
        trackTitle: 'Starboy (feat. Daft Punk)',
        artist: 'The Weeknd',
        source: 'Spotify',
        thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=120&auto=format&fit=crop&q=80',
        positionSec: 265,
        durationSec: 723,
        state: 'playing',
        clientTag: 'discolink/4.7.0',
        volume: 100,
        pingMs: 14,
    },
    {
        id: 'tr-2',
        guildId: '847291038475829102',
        guildName: 'Night City Syndicate',
        trackTitle: 'Resonance',
        artist: 'HOME',
        source: 'YouTube',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80',
        positionSec: 88,
        durationSec: 212,
        state: 'playing',
        clientTag: 'Lavalink.py/3.1.2',
        volume: 90,
        pingMs: 18,
    },
    {
        id: 'tr-3',
        guildId: '629104820194857291',
        guildName: 'Bollywood Beats & Lounge',
        trackTitle: 'Kesariya (From "Brahmastra")',
        artist: 'Arijit Singh, Pritam',
        source: 'JioSaavn',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
        positionSec: 145,
        durationSec: 268,
        state: 'playing',
        clientTag: 'Lavalink-Client-v4',
        volume: 85,
        pingMs: 22,
    },
    {
        id: 'tr-4',
        guildId: '918273645019283746',
        guildName: 'Valorant Ranked Clan',
        trackTitle: 'Die For You (ft. Grabbitz)',
        artist: 'VALORANT, Grabbitz',
        source: 'Spotify',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80',
        positionSec: 180,
        durationSec: 220,
        state: 'paused',
        clientTag: 'discolink/4.7.0',
        volume: 75,
        pingMs: 16,
    },
];

const INITIAL_BOTS: ConnectedBot[] = [
    {
        id: 'bot-1',
        clientTag: 'discolink/4.7.0',
        ipAddress: '10.0.4.12',
        botId: '918204859182740192',
        playersCount: 78,
        connectedSince: '4 hours ago',
    },
    {
        id: 'bot-2',
        clientTag: 'Lavalink.py/3.1.2',
        ipAddress: '10.0.6.88',
        botId: '728194019284719283',
        playersCount: 64,
        connectedSince: '12 hours ago',
    },
];

const INITIAL_BANS: BanEntry[] = [
    {
        id: 'ban-1',
        ipOrBotId: '198.51.100.44',
        reason: 'Rate limit violation (DoS attack)',
        bannedAt: 'Yesterday at 18:22',
    },
];

const CHART_DATA = {
    '30 min': [12, 18, 24, 32, 28, 42, 38, 55, 48, 62, 58, 74, 82, 95, 110, 142],
    '24 hours': [45, 60, 85, 120, 140, 180, 210, 240, 220, 190, 160, 175, 195, 230, 260, 310],
    '2 days': [180, 240, 310, 390, 440, 520, 480, 560, 610, 680, 720, 780, 820, 890, 940, 1020],
    '7 days': [850, 1100, 1340, 1480, 1620, 1800, 1950, 2100, 2240, 2400, 2550, 2700, 2900, 3100, 3250, 3480],
    '30 days': [3200, 4100, 5400, 6200, 7100, 8500, 9400, 10200, 11500, 12800, 13900, 14800, 15900, 17200, 18400, 19800],
};

function formatSec(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default () => {
    const [activeTab, setActiveTab] = useState<'console' | 'analyzer' | 'credentials' | 'settings'>('analyzer');

    // Server data from Pterodactyl ServerContext
    const serverName = ServerContext.useStoreState((state) => state.server.data?.name);
    const defaultAllocation = ServerContext.useStoreState((state) =>
        state.server.data?.allocations.find((a) => a.isDefault)
    );

    const hostString = defaultAllocation ? defaultAllocation.alias || ip(defaultAllocation.ip) : 'node1.vantahost.cloud';
    const portNumber = defaultAllocation ? defaultAllocation.port : 2333;

    // Analyzer state
    const [tracks, setTracks] = useState<PlayingTrack[]>(INITIAL_TRACKS);
    const [bots, setBots] = useState<ConnectedBot[]>(INITIAL_BOTS);
    const [bans, setBans] = useState<BanEntry[]>(INITIAL_BANS);
    const [chartTimeframe, setChartTimeframe] = useState<keyof typeof CHART_DATA>('30 min');
    const [showPassword, setShowPassword] = useState(false);
    const [password] = useState('youshallnotpass');
    const [isCopiedConfig, setIsCopiedConfig] = useState(false);

    // Live ticker for progress bars
    useEffect(() => {
        const timer = setInterval(() => {
            setTracks((prev) =>
                prev.map((tr) => {
                    if (tr.state !== 'playing') return tr;
                    const next = tr.positionSec + 1;
                    return {
                        ...tr,
                        positionSec: next >= tr.durationSec ? 0 : next,
                    };
                })
            );
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const togglePlayPause = (id: string) => {
        setTracks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, state: t.state === 'playing' ? 'paused' : 'playing' } : t))
        );
    };

    const stopTrack = (id: string) => {
        setTracks((prev) => prev.filter((t) => t.id !== id));
    };

    const kickBot = (botId: string) => {
        setBots((prev) => prev.filter((b) => b.id !== botId));
    };

    const banBot = (bot: ConnectedBot) => {
        setBots((prev) => prev.filter((b) => b.id !== bot.id));
        setBans((prev) => [
            ...prev,
            {
                id: `ban-${Date.now()}`,
                ipOrBotId: `${bot.ipAddress} (${bot.clientTag})`,
                reason: 'Manually banned from node analyzer',
                bannedAt: 'Just now',
            },
        ]);
    };

    const unbanIp = (banId: string) => {
        setBans((prev) => prev.filter((b) => b.id !== banId));
    };

    const handleCopyConfig = () => {
        const snippet = `server:\n  port: ${portNumber}\n  address: 0.0.0.0\nlavalink:\n  server:\n    password: "${password}"\n    sources:\n      youtube: true\n      bandcamp: true\n      soundcloud: true\n      twitch: true\n      vimeo: true\n      http: true\n      local: false\n    bufferDurationMs: 400\n    youtubePlaylistLoadLimit: 6`;
        navigator.clipboard.writeText(snippet);
        setIsCopiedConfig(true);
        setTimeout(() => setIsCopiedConfig(false), 2500);
    };

    // Calculate dynamic values for top metric cards
    const totalConnections = bots.length;
    const nowPlayingCount = tracks.filter((t) => t.state === 'playing').length;
    const totalPlayersCount = bots.reduce((sum, b) => sum + b.playersCount, 0);

    return (
        <ServerContentBlock title={'Lavalink Manager'} icon={VolumeUpIcon}>
            {/* Top Navigation Tabs: Console | Analyzer | Credentials | Settings */}
            <div className="liquid-glass p-2 mb-6 flex items-center justify-between gap-3 overflow-x-auto">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('analyzer')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            activeTab === 'analyzer'
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                        }`}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        Analyzer
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('console')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            activeTab === 'console'
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                        }`}
                    >
                        <TerminalIcon className="w-4 h-4" />
                        Console
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('credentials')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            activeTab === 'credentials'
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                        }`}
                    >
                        <KeyIcon className="w-4 h-4" />
                        Credentials
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                            activeTab === 'settings'
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                        }`}
                    >
                        <CogIcon className="w-4 h-4" />
                        Settings
                    </button>
                </div>

                <div className="flex items-center gap-2 pr-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Node Online
                    </span>
                </div>
            </div>

            {/* TAB 1: ANALYZER (Exact Heaven Cloud Lavalink UI) */}
            {activeTab === 'analyzer' && (
                <div className="space-y-6">
                    {/* 5 Top Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* 1. Connections */}
                        <div className="liquid-glass p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Connections</span>
                            <div className="my-2">
                                <span className="text-2xl font-bold font-mono text-neutral-100">{totalConnections}</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">bots</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">WebSocket Active</span>
                        </div>

                        {/* 2. Now playing */}
                        <div className="liquid-glass p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Now playing</span>
                            <div className="my-2">
                                <span className="text-2xl font-bold font-mono text-emerald-400">{nowPlayingCount}</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">guilds</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">Active Streams</span>
                        </div>

                        {/* 3. Players */}
                        <div className="liquid-glass p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Players</span>
                            <div className="my-2">
                                <span className="text-2xl font-bold font-mono text-neutral-100">{totalPlayersCount}</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">total</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">Created on node</span>
                        </div>

                        {/* 4. Failed tracks */}
                        <div className="liquid-glass p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Failed tracks</span>
                            <div className="my-2">
                                <span className="text-2xl font-bold font-mono text-neutral-100">0</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">errors</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Since last restart</span>
                        </div>

                        {/* 5. Bans */}
                        <div className="liquid-glass p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Bans</span>
                            <div className="my-2">
                                <span className="text-2xl font-bold font-mono text-amber-400">{bans.length}</span>
                                <span className="text-[11px] text-neutral-400 ml-1.5">active</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">Restricted access</span>
                        </div>
                    </div>

                    {/* Now Playing Section: Rich Horizontal Cards */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-neutral-100">Now Playing</h3>
                                <p className="text-xs text-neutral-400">Live streams currently decoded by this Lavalink instance</p>
                            </div>
                            <span className="text-xs text-neutral-400 font-mono">{tracks.length} active players</span>
                        </div>

                        <div className="space-y-2.5">
                            {tracks.map((track) => {
                                const progressRatio = Math.min(100, (track.positionSec / track.durationSec) * 100);
                                return (
                                    <div
                                        key={track.id}
                                        className="liquid-glass p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
                                    >
                                        {/* Track Info & Artwork */}
                                        <div className="flex items-center gap-3.5 min-w-[260px] max-w-sm">
                                            <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0 relative">
                                                <img
                                                    src={track.thumbnailUrl}
                                                    alt={track.trackTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-300 uppercase">
                                                        {track.source}
                                                    </span>
                                                    {track.state === 'playing' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 font-mono">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            Playing
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-amber-400 font-mono">
                                                            Paused
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-neutral-100 truncate mt-0.5">
                                                    {track.trackTitle}
                                                </p>
                                                <p className="text-xs text-neutral-400 truncate">
                                                    {track.artist}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar & Timestamps */}
                                        <div className="flex-1 max-w-md w-full">
                                            <div className="flex justify-between text-xs text-neutral-400 font-mono mb-1">
                                                <span>{formatSec(track.positionSec)}</span>
                                                <span>{formatSec(track.durationSec)}</span>
                                            </div>
                                            <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                                                <div
                                                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                                                    style={{ width: `${progressRatio}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metadata (Client Tag, Guild ID, Volume, Ping) */}
                                        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 shrink-0">
                                            <div className="hidden lg:block text-right">
                                                <span className="text-neutral-300 block">{track.clientTag}</span>
                                                <span className="text-[10px] text-neutral-500">Guild: {track.guildId.slice(0, 10)}...</span>
                                            </div>
                                            <div className="hidden sm:block text-right">
                                                <span className="text-neutral-300 block">Vol: {track.volume}%</span>
                                                <span className="text-[10px] text-emerald-400">{track.pingMs}ms</span>
                                            </div>

                                            {/* Action Controls */}
                                            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePlayPause(track.id)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white transition-colors"
                                                    title={track.state === 'playing' ? 'Pause' : 'Resume'}
                                                >
                                                    {track.state === 'playing' ? (
                                                        <PauseIcon className="w-4 h-4" />
                                                    ) : (
                                                        <PlayIcon className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => stopTrack(track.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                    title="Stop / Disconnect"
                                                >
                                                    <StopIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tracks Played Time-Series Bar Chart */}
                    <div className="liquid-glass p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div>
                                <h3 className="text-base font-semibold text-neutral-100">Tracks Played</h3>
                                <p className="text-xs text-neutral-400">Audio playback volume over time across connected bot sessions</p>
                            </div>

                            {/* Time filter tabs */}
                            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1 text-xs">
                                {(['30 min', '24 hours', '2 days', '7 days', '30 days'] as const).map((period) => (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() => setChartTimeframe(period)}
                                        className={`px-3 py-1 rounded-md transition-colors ${
                                            chartTimeframe === period
                                                ? 'bg-emerald-600/40 text-emerald-300 font-semibold border border-emerald-500/30'
                                                : 'text-neutral-400 hover:text-neutral-200'
                                        }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Bar Chart Visualization with Emerald Green Bars */}
                        <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2">
                            {CHART_DATA[chartTimeframe].map((val, idx) => {
                                const maxVal = Math.max(...CHART_DATA[chartTimeframe]);
                                const heightPercent = Math.max(8, (val / maxVal) * 100);
                                return (
                                    <div
                                        key={idx}
                                        className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                                    >
                                        <div
                                            className="w-full bg-emerald-500/30 border-t border-emerald-400/80 rounded-t group-hover:bg-emerald-500/60 group-hover:shadow-[0_0_12px_#10b981] transition-all"
                                            style={{ height: `${heightPercent}%` }}
                                        />
                                        {/* Hover Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 bg-neutral-900 border border-white/10 px-2 py-0.5 rounded text-[10px] text-neutral-200 font-mono transition-opacity shadow-lg z-20">
                                            {val} tracks
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bot Connections & Active Bans Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Connected Bots List */}
                        <div className="liquid-glass p-5">
                            <h3 className="text-sm font-semibold text-neutral-100 mb-1">Connected Bot Clients</h3>
                            <p className="text-xs text-neutral-400 mb-4">Bots with active WebSockets connected to this node</p>

                            <div className="space-y-2.5">
                                {bots.map((bot) => (
                                    <div
                                        key={bot.id}
                                        className="bg-black/30 border border-white/5 rounded-lg p-3.5 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-xs text-neutral-200 font-mono">
                                                    {bot.clientTag}
                                                </span>
                                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                                                    {bot.playersCount} players
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                                IP: {bot.ipAddress} | Bot ID: {bot.botId}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => kickBot(bot.id)}
                                                className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                                            >
                                                Kick
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => banBot(bot)}
                                                className="px-2.5 py-1 text-xs rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-colors"
                                            >
                                                Ban
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Bans List */}
                        <div className="liquid-glass p-5">
                            <h3 className="text-sm font-semibold text-neutral-100 mb-1">Active Bans</h3>
                            <p className="text-xs text-neutral-400 mb-4">IPs and clients banned from connecting to this node</p>

                            <div className="space-y-2.5">
                                {bans.length > 0 ? (
                                    bans.map((ban) => (
                                        <div
                                            key={ban.id}
                                            className="bg-black/30 border border-white/5 rounded-lg p-3.5 flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="font-semibold text-xs text-red-300 font-mono">
                                                    {ban.ipOrBotId}
                                                </span>
                                                <p className="text-[11px] text-neutral-400 mt-0.5">{ban.reason}</p>
                                                <span className="text-[10px] text-neutral-500 font-mono">{ban.bannedAt}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => unbanIp(ban.id)}
                                                className="px-3 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                            >
                                                Unban
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-neutral-500">
                                        No active bans on this node.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CONSOLE (Live Lavalink log stream) */}
            {activeTab === 'console' && (
                <div className="liquid-glass p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-neutral-100">Lavalink Node Console</h3>
                            <p className="text-xs text-neutral-400">Standard JVM output and audio frame logging</p>
                        </div>
                        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Streaming stdout
                        </span>
                    </div>

                    <div className="bg-[#050507] border border-white/10 rounded-xl p-4 font-mono text-xs text-neutral-300 h-96 overflow-y-auto space-y-1.5 select-text shadow-inner">
                        <div className="text-neutral-500">--- Lavalink v4.0.7 (JVM: Temurin-17.0.9+9) ---</div>
                        <div className="text-emerald-400">[main/INFO] (Launcher): Starting Lavalink...</div>
                        <div className="text-neutral-300">[main/INFO] (Launcher): Loading audio sources: YouTube, Soundcloud, Bandcamp, Twitch, JioSaavn</div>
                        <div className="text-neutral-300">[main/INFO] (Launcher): Initialized JDA-NAS native audio buffer for x86_64</div>
                        <div className="text-emerald-400">[main/INFO] (SocketServer): Listening for WebSocket connections on 0.0.0.0:{portNumber}</div>
                        <div className="text-neutral-400">[WS-Pool/INFO] (SocketContext): Handshake authorized from 10.0.4.12:54892 (Client: discolink/4.7.0)</div>
                        <div className="text-neutral-400">[WS-Pool/INFO] (SocketContext): Handshake authorized from 10.0.6.88:49210 (Client: Lavalink.py/3.1.2)</div>
                        <div className="text-neutral-300">[Player-1/INFO] (TrackManager): Playing track: "Starboy (feat. Daft Punk)" on Guild: 109283746501928374</div>
                        <div className="text-neutral-300">[Player-2/INFO] (TrackManager): Playing track: "Resonance" on Guild: 847291038475829102</div>
                        <div className="text-neutral-300">[Player-3/INFO] (TrackManager): Playing track: "Kesariya" on Guild: 629104820194857291</div>
                        <div className="text-emerald-400">[Stats/INFO] (SocketContext): Sent stats event to 2 connected clients (142 players, 142 playing, 1,280 MB RAM)</div>
                    </div>
                </div>
            )}

            {/* TAB 3: CREDENTIALS (Connection Details & Config) */}
            {activeTab === 'credentials' && (
                <div className="liquid-glass p-6 max-w-2xl mx-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-100">Node Connection Details</h3>
                        <p className="text-xs text-neutral-400 mt-1">Use these credentials in your Discord bot config to connect to this node</p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
                        {/* Host */}
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-400">Host / Address</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-neutral-200">{hostString}</span>
                                <CopyOnClick text={hostString}>
                                    <button type="button" className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors">
                                        <ClipboardCopyIcon className="w-4 h-4" />
                                    </button>
                                </CopyOnClick>
                            </div>
                        </div>

                        {/* Port */}
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-400">Port</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-neutral-200">{portNumber}</span>
                                <CopyOnClick text={String(portNumber)}>
                                    <button type="button" className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors">
                                        <ClipboardCopyIcon className="w-4 h-4" />
                                    </button>
                                </CopyOnClick>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-400">Password / Secret</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-neutral-200">
                                    {showPassword ? password : '••••••••••••••••'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                                <CopyOnClick text={password}>
                                    <button type="button" className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors">
                                        <ClipboardCopyIcon className="w-4 h-4" />
                                    </button>
                                </CopyOnClick>
                            </div>
                        </div>

                        {/* SSL */}
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-400">Secure WebSocket (SSL)</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                WSS Supported
                            </span>
                        </div>
                    </div>

                    {/* Copy Config Button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleCopyConfig}
                            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                        >
                            <ClipboardCopyIcon className="w-4 h-4" />
                            {isCopiedConfig ? 'Copied Node Config to Clipboard!' : 'Copy application.yml Config'}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
                <div className="liquid-glass p-6 max-w-2xl mx-auto space-y-5">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-100">Lavalink Node Configuration</h3>
                        <p className="text-xs text-neutral-400 mt-1">Adjust runtime audio parameters and source providers</p>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-lg">
                            <div>
                                <span className="font-semibold text-neutral-200 block">JDA-NAS Native Audio Buffer</span>
                                <span className="text-neutral-500">Reduces audio stuttering using kernel-level ring buffers</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-semibold">Enabled</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-lg">
                            <div>
                                <span className="font-semibold text-neutral-200 block">YouTube Source Provider v2</span>
                                <span className="text-neutral-500">Supports bot bypass and proxy rotation</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-semibold">Enabled</span>
                        </div>

                        <div className="p-3.5 bg-black/40 border border-white/5 rounded-lg space-y-2">
                            <span className="font-semibold text-neutral-200 block">Spotify Client Secret & ID</span>
                            <input
                                type="text"
                                placeholder="Spotify Client ID"
                                defaultValue="d4a8e2194b1029c781"
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-neutral-200 font-mono outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-lg">
                            <div>
                                <span className="font-semibold text-neutral-200 block">Frame Buffer Duration</span>
                                <span className="text-neutral-500">Lavalink buffer before sending audio packets</span>
                            </div>
                            <span className="text-neutral-300 font-mono font-semibold">400 ms</span>
                        </div>
                    </div>
                </div>
            )}
        </ServerContentBlock>
    );
};

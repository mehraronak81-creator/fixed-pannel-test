import React, { useState, useEffect, useMemo } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { useTranslation } from 'react-i18next';
import { LuFolderPlus } from 'react-icons/lu';
import {
    ServerIcon,
    RefreshIcon,
    PlayIcon,
    PauseIcon,
    FastForwardIcon,
    StopIcon,
    SearchIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    WifiIcon,
    ChipIcon,
    DatabaseIcon,
    VolumeUpIcon,
    MusicNoteIcon,
} from '@heroicons/react/outline';

interface PlayingTrack {
    guildId: string;
    guildName: string;
    trackTitle: string;
    artist: string;
    source: 'Spotify' | 'YouTube' | 'SoundCloud';
    positionMs: number;
    durationMs: number;
    state: 'playing' | 'paused' | 'buffering';
    volume: number;
}

interface LavalinkNode {
    id: string;
    name: string;
    version: string;
    host: string;
    port: number;
    connected: boolean;
    uptimeSeconds: number;
    pingMs: number;
    activePlayers: number;
    totalPlayers: number;
    memoryUsedMb: number;
    memoryAllocatedMb: number;
    cpuLavalinkPercent: number;
    cpuSystemPercent: number;
    cpuCores: number;
}

const INITIAL_NODES: LavalinkNode[] = [
    {
        id: 'node-1',
        name: 'Node-01 (Primary US-East)',
        version: 'v4.0.7',
        host: 'lavalink-01.vanta.internal',
        port: 2333,
        connected: true,
        uptimeSeconds: 1234567,
        pingMs: 14,
        activePlayers: 142,
        totalPlayers: 186,
        memoryUsedMb: 1280,
        memoryAllocatedMb: 4096,
        cpuLavalinkPercent: 4.8,
        cpuSystemPercent: 14.2,
        cpuCores: 8,
    },
    {
        id: 'node-2',
        name: 'Node-02 (EU-Central)',
        version: 'v4.0.7',
        host: 'lavalink-02.vanta.internal',
        port: 2333,
        connected: true,
        uptimeSeconds: 612400,
        pingMs: 28,
        activePlayers: 94,
        totalPlayers: 118,
        memoryUsedMb: 940,
        memoryAllocatedMb: 4096,
        cpuLavalinkPercent: 3.2,
        cpuSystemPercent: 11.5,
        cpuCores: 8,
    },
];

const INITIAL_TRACKS: PlayingTrack[] = [
    {
        guildId: '109283746501928374',
        guildName: 'CyberVibe Community',
        trackTitle: 'Starboy (feat. Daft Punk)',
        artist: 'The Weeknd',
        source: 'Spotify',
        positionMs: 142000,
        durationMs: 230000,
        state: 'playing',
        volume: 90,
    },
    {
        guildId: '847291038475829102',
        guildName: 'Night City Radio',
        trackTitle: 'Resonance',
        artist: 'HOME',
        source: 'YouTube',
        positionMs: 88000,
        durationMs: 212000,
        state: 'playing',
        volume: 100,
    },
    {
        guildId: '629104820194857291',
        guildName: 'Chill & Lo-Fi Lounge',
        trackTitle: 'Coffee Breath (Lofi Beat)',
        artist: 'Kudasai',
        source: 'SoundCloud',
        positionMs: 45000,
        durationMs: 165000,
        state: 'playing',
        volume: 80,
    },
    {
        guildId: '918273645019283746',
        guildName: 'Valorant Ranked Lobby',
        trackTitle: 'Die For You (ft. Grabbitz)',
        artist: 'VALORANT, Grabbitz',
        source: 'Spotify',
        positionMs: 180000,
        durationMs: 220000,
        state: 'paused',
        volume: 75,
    },
    {
        guildId: '548291038475820194',
        guildName: 'Anime Syndicate',
        trackTitle: 'KICK BACK',
        artist: 'Kenshi Yonezu',
        source: 'YouTube',
        positionMs: 95000,
        durationMs: 193000,
        state: 'playing',
        volume: 100,
    },
    {
        guildId: '381920485719384720',
        guildName: 'Minecraft SMP Tavern',
        trackTitle: 'Sweden',
        artist: 'C418',
        source: 'YouTube',
        positionMs: 110000,
        durationMs: 215000,
        state: 'playing',
        volume: 85,
    },
];

function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

function formatDuration(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default () => {
    const { t } = useTranslation('vantablack/dashboard');
    const [nodes, setNodes] = useState<LavalinkNode[]>(INITIAL_NODES);
    const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
    const [tracks, setTracks] = useState<PlayingTrack[]>(INITIAL_TRACKS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterState, setFilterState] = useState<'all' | 'playing' | 'paused'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentNode = useMemo(
        () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
        [nodes, selectedNodeId]
    );

    // Live clock for uptime ticker and position progress
    useEffect(() => {
        const timer = setInterval(() => {
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    uptimeSeconds: n.connected ? n.uptimeSeconds + 1 : n.uptimeSeconds,
                }))
            );

            setTracks((prev) =>
                prev.map((tr) => {
                    if (tr.state !== 'playing') return tr;
                    const nextPos = tr.positionMs + 1000;
                    return {
                        ...tr,
                        positionMs: nextPos >= tr.durationMs ? 0 : nextPos,
                    };
                })
            );
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    pingMs: Math.max(10, Math.floor(n.pingMs + (Math.random() * 6 - 3))),
                    cpuLavalinkPercent: Math.max(1.5, Number((n.cpuLavalinkPercent + (Math.random() * 1 - 0.5)).toFixed(1))),
                    cpuSystemPercent: Math.max(8.0, Number((n.cpuSystemPercent + (Math.random() * 2 - 1)).toFixed(1))),
                }))
            );
            setIsRefreshing(false);
        }, 500);
    };

    const toggleTrackState = (guildId: string) => {
        setTracks((prev) =>
            prev.map((t) => {
                if (t.guildId !== guildId) return t;
                return {
                    ...t,
                    state: t.state === 'playing' ? 'paused' : 'playing',
                };
            })
        );
    };

    const stopTrack = (guildId: string) => {
        setTracks((prev) => prev.filter((t) => t.guildId !== guildId));
    };

    const filteredTracks = tracks.filter((t) => {
        if (filterState !== 'all' && t.state !== filterState) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.guildId.toLowerCase().includes(q) ||
            t.guildName.toLowerCase().includes(q) ||
            t.trackTitle.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q)
        );
    });

    const memPercent = Math.min(100, (currentNode.memoryUsedMb / currentNode.memoryAllocatedMb) * 100);
    const playersPercent = Math.min(100, (currentNode.activePlayers / currentNode.totalPlayers) * 100);

    return (
        <PageContentBlock title={'Lavalink Nodes'} showFlashKey={'lavalink'}>
            {/* Breadcrumb Header Bar */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 font-medium">
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
                <span className="text-gray-600">/</span>
                <span className="text-gray-100 font-semibold">Lavalink Nodes</span>
            </div>

            {/* Main Node Header Card in liquid-glass */}
            <div className="liquid-glass p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start md:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
                        <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-gray-100">{currentNode.name}</h2>
                            <span className="px-2.5 py-0.5 text-xs rounded-md bg-white/10 text-gray-300 border border-white/15 font-mono">
                                {currentNode.version}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Connected
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap font-mono">
                            <span>Host: <strong className="text-gray-200">{currentNode.host}:{currentNode.port}</strong></span>
                            <span>Uptime: <strong className="text-gray-200">{formatUptime(currentNode.uptimeSeconds)}</strong></span>
                            <span className="inline-flex items-center gap-1">
                                <WifiIcon className="w-3.5 h-3.5 text-emerald-400" />
                                Ping: <strong className="text-emerald-400">{currentNode.pingMs}ms</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Node Switcher & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <select
                        value={selectedNodeId}
                        onChange={(e) => setSelectedNodeId(e.target.value)}
                        className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none cursor-pointer transition-colors"
                    >
                        {nodes.map((node) => (
                            <option key={node.id} value={node.id} className="bg-slate-900 text-gray-200">
                                {node.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-200 border border-white/15 transition-all shadow-sm"
                    >
                        <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid: 4 Blocks matching .liquid-glass styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Block 1: Active Players */}
                <div className="liquid-glass p-5 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Players</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <PlayIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-100 font-mono">{currentNode.activePlayers}</span>
                            <span className="text-xs text-gray-400">/ {currentNode.totalPlayers} total</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${playersPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-1 border-t border-white/5">
                        <span>Playing: <strong className="text-gray-200">{currentNode.activePlayers}</strong></span>
                        <span>Idle: <strong className="text-gray-200">{currentNode.totalPlayers - currentNode.activePlayers}</strong></span>
                    </div>
                </div>

                {/* Block 2: Total Connections */}
                <div className="liquid-glass p-5 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Connections</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ServerIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-100 font-mono">{currentNode.totalPlayers}</span>
                            <span className="text-xs text-emerald-400">Voice Channels</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-1 border-t border-white/5">
                        <span>WS Frame Ping</span>
                        <span className="text-emerald-400 font-bold">{currentNode.pingMs}ms</span>
                    </div>
                </div>

                {/* Block 3: Memory Usage (JVM) */}
                <div className="liquid-glass p-5 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Memory Usage (JVM)</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <DatabaseIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-100 font-mono">{currentNode.memoryUsedMb}</span>
                            <span className="text-xs text-gray-400">MB / {currentNode.memoryAllocatedMb} MB</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${memPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-1 border-t border-white/5">
                        <span>Heap Usage: {memPercent.toFixed(1)}%</span>
                        <span>Free: {(currentNode.memoryAllocatedMb - currentNode.memoryUsedMb)} MB</span>
                    </div>
                </div>

                {/* Block 4: CPU Usage (System / Lavalink) */}
                <div className="liquid-glass p-5 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">CPU Usage</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <ChipIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-100 font-mono">{currentNode.cpuLavalinkPercent}%</span>
                            <span className="text-xs text-gray-400 font-mono">(Sys: {currentNode.cpuSystemPercent}%)</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, currentNode.cpuLavalinkPercent * 5)}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-1 border-t border-white/5">
                        <span>System: {currentNode.cpuSystemPercent}%</span>
                        <span>{currentNode.cpuCores} Cores Available</span>
                    </div>
                </div>
            </div>

            {/* Live Activity Table Section */}
            <div className="liquid-glass p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                            <span>Live Activity & Guild Tracks</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {filteredTracks.length} Active
                            </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Real-time audio streams playing across registered Discord servers</p>
                    </div>

                    {/* Filter and Search Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 gap-2 w-full sm:w-64">
                            <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search guild or track..."
                                className="bg-transparent border-none outline-none text-xs text-gray-200 placeholder-gray-500 w-full"
                            />
                        </div>

                        <div className="flex rounded-lg bg-white/5 border border-white/10 p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setFilterState('all')}
                                className={`px-2.5 py-1 rounded transition-colors ${filterState === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterState('playing')}
                                className={`px-2.5 py-1 rounded transition-colors ${filterState === 'playing' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Playing
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterState('paused')}
                                className={`px-2.5 py-1 rounded transition-colors ${filterState === 'paused' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Paused
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead>
                            <tr className="border-b border-white/10 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                                <th className="pb-3 px-4">Guild ID / Server</th>
                                <th className="pb-3 px-4">Current Track & Artist</th>
                                <th className="pb-3 px-4">State</th>
                                <th className="pb-3 px-4">Progress / Duration</th>
                                <th className="pb-3 px-4">Volume</th>
                                <th className="pb-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTracks.length > 0 ? (
                                filteredTracks.map((track) => {
                                    const progressPercent = Math.min(100, (track.positionMs / track.durationMs) * 100);
                                    return (
                                        <tr key={track.guildId} className="hover:bg-white/[0.03] transition-colors group">
                                            {/* Guild Info */}
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-200">{track.guildName}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {track.guildId}</div>
                                            </td>

                                            {/* Track Info */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-indigo-400">
                                                        <VolumeUpIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-100 truncate max-w-xs">{track.trackTitle}</div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                            <span className="truncate max-w-[140px]">{track.artist}</span>
                                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono">
                                                                {track.source}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Player State Badge */}
                                            <td className="py-4 px-4">
                                                {track.state === 'playing' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                                        Playing
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        Paused
                                                    </span>
                                                )}
                                            </td>

                                            {/* Progress Bar & Timestamps */}
                                            <td className="py-4 px-4 min-w-[160px]">
                                                <div className="flex justify-between text-xs text-gray-400 font-mono mb-1">
                                                    <span>{formatDuration(track.positionMs)}</span>
                                                    <span>{formatDuration(track.durationMs)}</span>
                                                </div>
                                                <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Volume */}
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-mono text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/10">
                                                    {track.volume}%
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTrackState(track.guildId)}
                                                        title={track.state === 'playing' ? 'Pause' : 'Resume'}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                                                    >
                                                        {track.state === 'playing' ? (
                                                            <PauseIcon className="w-4 h-4" />
                                                        ) : (
                                                            <PlayIcon className="w-4 h-4 text-emerald-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => stopTrack(track.guildId)}
                                                        title="Disconnect / Stop"
                                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors"
                                                    >
                                                        <StopIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">
                                        No active audio players matching your search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageContentBlock>
    );
};

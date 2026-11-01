import { useCallback, useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';

// Words from standard server list headers, loggers, commands, and ranks that must NEVER be treated as player names
export const IGNORED_WORDS = new Set([
    'there',
    'are',
    'out',
    'of',
    'maximum',
    'max',
    'players',
    'online',
    'server',
    'info',
    'thread',
    'default',
    'none',
    'list',
    'connected',
    'current',
    'total',
    'logged',
    'game',
    'left',
    'lost',
    'connection',
    'timed',
    'console',
    'uuid',
    'player',
    'warn',
    'error',
    'command',
    'unknown',
    'help',
    'async',
    'chat',
    'all',
    'members',
    'admin',
    'admins',
    'moderator',
    'moderators',
    'owner',
    'owners',
    'vip',
    'vips',
    'user',
    'users',
]);

/**
 * Strips ANSI escape sequences, Minecraft § and & color codes, and logger prefixes
 */
export const clean = (rawLine: string): string =>
    rawLine
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
        .replace(/\x1b\[[0-9;]*m/g, '')
        .replace(/\[[0-9;]*m/g, '')
        .replace(/§[0-9a-fk-orx]/gi, '')
        .replace(/&[0-9a-fk-orx]/gi, '')
        .replace(/§/g, '')
        .replace(/^.*?\]:\s*/, '')
        .trim();

/**
 * Extracts all valid Minecraft player usernames from a roster console line.
 * In Minecraft (Vanilla, EssentialsX, Paper, Spigot), group/roster lines ALWAYS contain a colon (:),
 * where the group name or header is before the colon, and the player names are after the colon.
 */
export const extractPlayerNamesFromLine = (line: string): string[] => {
    if (!line) return [];

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return [];

    const content = line.slice(colonIdx + 1).trim();
    if (!content) return [];

    // Split by commas, spaces, tabs, pipe
    const rawTokens = content.split(/[, \t|]+/);
    const validNames: string[] = [];

    for (const token of rawTokens) {
        if (!token) continue;
        let s = token.trim();
        // Strip color codes
        s = s.replace(/§[0-9a-fk-orx]/gi, '').replace(/&[0-9a-fk-orx]/gi, '');
        // Strip brackets like [Admin], [VIP], [AFK]
        s = s.replace(/\[[^\]]*\]/g, '').trim();
        // Strip parentheses like (AFK), (Guest)
        s = s.replace(/\([^)]*\)/g, '').trim();
        // Strip symbols like ~ (EssentialsX nicknames), * (OPs), +, -, #, . (GeyserMC/Floodgate Bedrock)
        s = s.replace(/^[~*+#\-\.]+/g, '').trim();

        // Valid Minecraft Java & Bedrock usernames
        if (/^[A-Za-z0-9_]{3,16}$/.test(s) && !IGNORED_WORDS.has(s.toLowerCase())) {
            validNames.push(s);
        }
    }

    return validNames;
};

const JOIN_REGEX = /(?:UUID of player\s+([A-Za-z0-9_]{3,16})\s+is|\b([A-Za-z0-9_]{3,16})\b\s+(?:joined the game|connected|logged in))/i;
const LEAVE_REGEX = /\b([A-Za-z0-9_]{3,16})\b\s+(?:left the game|lost connection|disconnected|timed out)/i;

export interface OnlinePlayer {
    name: string;
    uuid?: string;
    since: number;
}

export interface UsePlayersReturn {
    players: OnlinePlayer[];
    serverReportedCount: number | null;
    refresh: () => void;
    pingOnlineCount: number | null;
}

/**
 * Robust live Minecraft player detection hook:
 * 1. Sends both `minecraft:list` (Vanilla) and `list` (EssentialsX/Paper)
 * 2. Immediately flushes old Wings scrollback console replay
 * 3. Incrementally gathers all player names across multiple group lines (Admins, default, etc.)
 * 4. Combines with live https://api.mcsrvstat.us/3/ socket ping
 * 5. Accurately tracks live Join/Leave events post-sync
 */
export default (counter = 0): UsePlayersReturn => {
    const [players, setPlayers] = useState<Record<string, OnlinePlayer>>({});
    const [serverReportedCount, setServerReportedCount] = useState<number | null>(null);
    const [pingOnlineCount, setPingOnlineCount] = useState<number | null>(null);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data?.allocations.find((a) => a.isDefault);
        return match || state.server.data?.allocations[0];
    });

    const isSynchronized = useRef(false);
    const activeRosterWindowUntil = useRef(0);

    // Clear roster when server stops
    useEffect(() => {
        if (status === 'offline' || status === 'stopping') {
            setPlayers({});
            setServerReportedCount(0);
            setPingOnlineCount(null);
            isSynchronized.current = false;
            activeRosterWindowUntil.current = 0;
        }
    }, [status]);

    // Live Minecraft Server Status Ping (https://api.mcsrvstat.us/3/)
    const pingServer = useCallback(() => {
        if (!allocation) return;
        const host = allocation.alias || allocation.ip;
        const port = allocation.port;
        if (!host || !port) return;

        const isInternal = /^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.|^127\./.test(host);
        const queryHost = allocation.alias || (!isInternal ? host : null);
        if (!queryHost) return;

        const url = `https://api.mcsrvstat.us/3/${encodeURIComponent(queryHost)}:${port}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                if (data && data.online) {
                    const online = typeof data.players?.online === 'number' ? data.players.online : null;
                    if (online !== null) {
                        setPingOnlineCount(online);
                        setServerReportedCount((prev) => (prev === null ? online : prev));
                    }
                    if (Array.isArray(data.players?.list) && data.players.list.length > 0) {
                        setPlayers((prev) => {
                            const next = { ...prev };
                            data.players.list.forEach((p: { name: string; uuid?: string }) => {
                                const valid = p.name ? p.name.replace(/^[~*+#\-\.]+/g, '').trim() : '';
                                if (valid && /^[A-Za-z0-9_]{3,16}$/.test(valid) && !IGNORED_WORDS.has(valid.toLowerCase())) {
                                    next[valid] = {
                                        name: valid,
                                        uuid: p.uuid || next[valid]?.uuid,
                                        since: next[valid]?.since || counter || Date.now(),
                                    };
                                }
                            });
                            return next;
                        });
                    }
                }
            })
            .catch(() => {
                // Silently ignore ping errors
            });
    }, [allocation, counter]);

    // Primary refresh: executes both minecraft:list and list, and polls mcsrvstat.us
    const refresh = useCallback(() => {
        if (connected && instance && status === 'running') {
            instance.send('send command', 'minecraft:list');
            instance.send('send command', 'list');
            pingServer();
        }
    }, [connected, instance, status, pingServer]);

    // Auto-poll on initial socket connection after 500ms (letting Wings flush scrollback history first)
    useEffect(() => {
        if (connected && instance && status === 'running') {
            const timer = window.setTimeout(() => {
                refresh();
            }, 500);
            return () => window.clearTimeout(timer);
        }
        return undefined;
    }, [connected, instance, status, refresh]);

    // WebSocket console stream listener
    useEffect(() => {
        if (!connected || !instance) return;

        const handler = (raw: string) => {
            if (!raw) return;
            const line = clean(raw);
            if (!line) return;

            // 1. Check for count header: "There are X of Y players online" or "There are X out of maximum Y players online."
            const countMatch =
                line.match(/(?:There are\s+)?(\d+)\s*(?:of a max(?:imum)?(?: of)?|out of maximum|\/)\s*(\d+)\s*(?:players online)?/i) ||
                line.match(/(\d+)\s*\/\s*(\d+)\s*players online/i) ||
                line.match(/players online:?\s*(\d+)/i);

            if (countMatch) {
                const count = parseInt(countMatch[1], 10);
                const safeCount = isNaN(count) ? 0 : count;
                setServerReportedCount(safeCount);

                if (safeCount === 0) {
                    setPlayers({});
                    isSynchronized.current = true;
                    activeRosterWindowUntil.current = 0;
                    return;
                }

                // Fresh count > 0: start an active window of 3500ms to accumulate players from same line and any subsequent group lines
                // Wipe scrollback to start fresh collection
                setPlayers({});
                isSynchronized.current = true;

                // If same line has players after colon (e.g. Vanilla "There are 2 of a max 20 online: p1, p2")
                const namesOnSameLine = extractPlayerNamesFromLine(line);
                if (namesOnSameLine.length > 0) {
                    setPlayers((prev) => {
                        const next = { ...prev };
                        namesOnSameLine.forEach((name) => {
                            next[name] = { name, since: counter || Date.now() };
                        });
                        return next;
                    });
                }

                activeRosterWindowUntil.current = Date.now() + 3500;
                return;
            }

            // 2. If actively accumulating group lines from EssentialsX / Paper multi-line list (e.g. "Admins: ...", "default: ...")
            if (Date.now() < activeRosterWindowUntil.current) {
                const names = extractPlayerNamesFromLine(line);
                if (names.length > 0) {
                    setPlayers((prev) => {
                        const next = { ...prev };
                        names.forEach((name) => {
                            if (!next[name]) {
                                next[name] = { name, since: counter || Date.now() };
                            }
                        });
                        return next;
                    });
                    return;
                }
            }

            // 3. Post-baseline live Join events
            if (isSynchronized.current) {
                const joinMatch = line.match(JOIN_REGEX);
                if (joinMatch) {
                    const rawName = joinMatch[1] || joinMatch[2];
                    if (rawName && !IGNORED_WORDS.has(rawName.toLowerCase()) && /^[A-Za-z0-9_]{3,16}$/.test(rawName)) {
                        setPlayers((prev) => {
                            if (prev[rawName]) return prev;
                            return { ...prev, [rawName]: { name: rawName, since: counter || Date.now() } };
                        });
                        setServerReportedCount((prev) => (prev !== null ? prev + 1 : 1));
                        return;
                    }
                }

                // 4. Post-baseline live Leave events
                const leaveMatch = line.match(LEAVE_REGEX);
                if (leaveMatch) {
                    const rawName = leaveMatch[1];
                    if (rawName) {
                        setPlayers((prev) => {
                            if (!prev[rawName]) return prev;
                            const next = { ...prev };
                            delete next[rawName];
                            return next;
                        });
                        setServerReportedCount((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
                        return;
                    }
                }
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, handler);
        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, handler);
        };
    }, [connected, instance, counter]);

    return {
        players: Object.values(players).sort((a, b) => a.name.localeCompare(b.name)),
        serverReportedCount,
        refresh,
        pingOnlineCount,
    };
};

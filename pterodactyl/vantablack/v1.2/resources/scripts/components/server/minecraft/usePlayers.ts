import { useCallback, useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';

// Blacklist of words from standard server list headers, loggers, and commands that must NEVER be treated as player names
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
]);

/**
 * Strips ANSI escape sequences, Minecraft § color formatting, and log prefixes like "[12:34:56 INFO]:"
 */
export const clean = (rawLine: string): string =>
    rawLine
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
        .replace(/\x1b\[[0-9;]*m/g, '')
        .replace(/\[[0-9;]*m/g, '')
        .replace(/§[0-9a-fk-orx]/gi, '')
        .replace(/§/g, '')
        .replace(/^.*?\]:\s*/, '')
        .trim();

/**
 * Validates and extracts a single valid Minecraft username from player tokens that may have
 * rank prefixes or suffixes (e.g. "[Admin] Steve", "Alex (AFK)", "default: Notch", "~kokoshibo01", "*Herobrine").
 * Strictly rejects any token containing spaces, invalid characters, or blacklisted words.
 */
export const extractPlayerName = (token: string): string | null => {
    if (!token) return null;
    let s = token.trim();
    // Strip brackets like [Admin], [Mod], [VIP], [AFK]
    s = s.replace(/\[[^\]]*\]/g, '').trim();
    // Strip parentheses like (AFK), (Guest)
    s = s.replace(/\([^)]*\)/g, '').trim();
    // Strip rank/group prefix like "default: Notch" or "Admin: Steve" or "Admins:"
    s = s.replace(/^[a-zA-Z0-9_-]+:\s*/, '').trim();
    // Strip symbols like ~ (EssentialsX nickname prefix), * (OP prefix), +, -, #
    s = s.replace(/^[~*+#\-]+\s*/, '').trim();

    // A valid Minecraft Java Edition username must be strictly 3 to 16 alphanumeric characters or underscores
    if (!/^[A-Za-z0-9_]{3,16}$/.test(s)) {
        return null;
    }

    if (IGNORED_WORDS.has(s.toLowerCase())) {
        return null;
    }

    return s;
};

// Vanilla, Paper, Purpur, Spigot, EssentialsX, Velocity patterns:
// "There are 0 of a max of 20 players online:" (minecraft:list / Paper / Vanilla)
// "There are 1 of a max of 20 players online: Steve"
// "There are 2 out of maximum 20 players online." (EssentialsX)
// "There are 2/20 players online: Steve, Alex"
// "There are 0 players online."
const LIST_HEADER_REGEX = /^There are (\d+)\s*(?:of a max(?:imum)?(?: of)?|out of maximum|\/)?\s*(\d+)?\s*players online\.?:?\s*(.*)$/i;

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
 * Tracks which players are currently online by combining:
 * 1. Vanilla `minecraft:list` command (bypasses EssentialsX multi-line formatting)
 * 2. Multi-line group accumulator (for EssentialsX `/list` fallback)
 * 3. Historical console scrollback suppression (ignoring stale Join/Leave replay on mount)
 * 4. Real live Minecraft Server Status Ping (https://api.mcsrvstat.us/3/)
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

    // Ref to ignore old scrollback history:
    // Only accept live JOIN / LEAVE events AFTER a fresh list command establishes baseline
    const isSynchronized = useRef(false);

    // Multi-line accumulator ref for EssentialsX rank groups
    const accumulator = useRef<{
        targetCount: number;
        collected: Map<string, OnlinePlayer>;
        expiry: number;
    } | null>(null);

    // Clear roster when server stops
    useEffect(() => {
        if (status === 'offline' || status === 'stopping') {
            setPlayers({});
            setServerReportedCount(0);
            setPingOnlineCount(null);
            isSynchronized.current = false;
            accumulator.current = null;
        }
    }, [status]);

    // Live Minecraft Server Status Ping (https://api.mcsrvstat.us/3/)
    const pingServer = useCallback(() => {
        if (!allocation) return;
        const host = allocation.alias || allocation.ip;
        const port = allocation.port;
        if (!host || !port) return;

        // Skip internal RFC1918 addresses unless alias domain is set
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
                                const valid = extractPlayerName(p.name);
                                if (valid) {
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

    // Primary refresh: sends 'minecraft:list' (bypasses EssentialsX), polls ping, and fallbacks to 'list'
    const refresh = useCallback(() => {
        if (connected && instance && status === 'running') {
            accumulator.current = null;
            // Send minecraft:list first
            instance.send('send command', 'minecraft:list');
            // Ping server status in parallel
            pingServer();
            // In 750ms, also send fallback 'list' if server hasn't answered yet
            const fallbackTimer = window.setTimeout(() => {
                if (!isSynchronized.current && connected && instance) {
                    instance.send('send command', 'list');
                }
            }, 750);
            return () => window.clearTimeout(fallbackTimer);
        }
        return undefined;
    }, [connected, instance, status, pingServer]);

    // Auto-poll on initial socket connection after 600ms (letting Wings flush scrollback history first)
    useEffect(() => {
        if (connected && instance && status === 'running') {
            const timer = window.setTimeout(() => {
                refresh();
            }, 600);
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

            // 1. If actively accumulating multi-line player names (e.g. EssentialsX "Admins: ...", "default: ...")
            if (accumulator.current) {
                const now = Date.now();
                if (now < accumulator.current.expiry) {
                    const rawTokens = line.split(',');
                    rawTokens.forEach((token) => {
                        const name = extractPlayerName(token);
                        if (name) {
                            accumulator.current?.collected.set(name, {
                                name,
                                since: counter || Date.now(),
                            });
                        }
                    });

                    // Check if target count is reached
                    if (accumulator.current.collected.size >= accumulator.current.targetCount) {
                        const newRoster: Record<string, OnlinePlayer> = {};
                        accumulator.current.collected.forEach((val, key) => {
                            newRoster[key] = val;
                        });
                        setPlayers(newRoster);
                        isSynchronized.current = true;
                        accumulator.current = null;
                        return;
                    }
                } else {
                    // Timeout expired: commit whatever was collected
                    if (accumulator.current.collected.size > 0) {
                        const newRoster: Record<string, OnlinePlayer> = {};
                        accumulator.current.collected.forEach((val, key) => {
                            newRoster[key] = val;
                        });
                        setPlayers(newRoster);
                    }
                    isSynchronized.current = true;
                    accumulator.current = null;
                }
            }

            // 2. Check for "There are X of Y players online" header (Vanilla / Paper / EssentialsX)
            const listHeaderMatch = line.match(LIST_HEADER_REGEX);
            if (listHeaderMatch) {
                const count = parseInt(listHeaderMatch[1], 10);
                const safeCount = isNaN(count) ? 0 : count;

                setServerReportedCount(safeCount);

                // Instantly wipe existing players map to discard any stale scrollback history!
                setPlayers({});

                if (safeCount === 0) {
                    isSynchronized.current = true;
                    accumulator.current = null;
                    return;
                }

                // If safeCount > 0, parse trailing player names on the same line (if any)
                const trailing = listHeaderMatch[3]?.trim();
                const sameLineCollected = new Map<string, OnlinePlayer>();

                if (trailing) {
                    const rawTokens = trailing.split(',');
                    rawTokens.forEach((token) => {
                        const name = extractPlayerName(token);
                        if (name) {
                            sameLineCollected.set(name, { name, since: counter || Date.now() });
                        }
                    });
                }

                // If all players were listed on the same line (Vanilla / minecraft:list)
                if (sameLineCollected.size >= safeCount) {
                    const newRoster: Record<string, OnlinePlayer> = {};
                    sameLineCollected.forEach((val, key) => {
                        newRoster[key] = val;
                    });
                    setPlayers(newRoster);
                    isSynchronized.current = true;
                    accumulator.current = null;
                    return;
                }

                // Otherwise, players are split across subsequent lines (EssentialsX multi-rank lines)
                accumulator.current = {
                    targetCount: safeCount,
                    collected: sameLineCollected,
                    expiry: Date.now() + 1500,
                };
                return;
            }

            // 3. Track live Join events (STRICTLY IGNORED until baseline list is established!)
            if (isSynchronized.current) {
                const joinMatch = line.match(JOIN_REGEX);
                if (joinMatch) {
                    const rawName = joinMatch[1] || joinMatch[2];
                    const name = extractPlayerName(rawName);
                    if (name) {
                        setPlayers((prev) => {
                            if (prev[name]) return prev;
                            return { ...prev, [name]: { name, since: counter || Date.now() } };
                        });
                        setServerReportedCount((prev) => (prev !== null ? prev + 1 : 1));
                        return;
                    }
                }

                // 4. Track live Leave events (STRICTLY IGNORED until baseline list is established!)
                const leaveMatch = line.match(LEAVE_REGEX);
                if (leaveMatch) {
                    const rawName = leaveMatch[1];
                    const name = extractPlayerName(rawName);
                    if (name) {
                        setPlayers((prev) => {
                            if (!prev[name]) return prev;
                            const next = { ...prev };
                            delete next[name];
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

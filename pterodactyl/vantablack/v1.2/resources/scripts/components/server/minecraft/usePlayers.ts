import { useCallback, useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';

// ANSI escape codes & Minecraft color/formatting codes (§0-9, §a-f, §k-o, §r, §x)
const ANSI = /\x1b\[[0-9;]*[a-zA-Z]|\[[0-9;]*m/g;
const SECTION = /§[0-9a-fk-orx]/gi;

const clean = (line: string): string =>
    line
        .replace(ANSI, '')
        .replace(SECTION, '')
        .replace(/§/g, '')
        // Drop leading timestamp / thread prefixes: "[12:34:56 INFO]:" or "[Server thread/INFO]:"
        .replace(/^\[[^\]]*\]\s*(\[[^\]]*\]:?\s*)?/g, '')
        .trim();

/**
 * Extracts a valid Minecraft username from player tokens that may have
 * prefixes or suffixes (e.g. "[Admin] Steve", "Alex (AFK)", "default: Notch", "*Herobrine")
 */
export const extractPlayerName = (token: string): string | null => {
    if (!token) return null;
    let s = token.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, '');
    s = s.replace(/^[a-zA-Z0-9_-]+:\s*/, '');
    s = s.replace(/[*~+]/g, '').trim();
    const match = s.match(/\b([A-Za-z0-9_]{3,16})\b/);
    return match ? match[1] : null;
};

// Vanilla, Paper, Purpur, Spigot, EssentialsX, Velocity patterns
const LIST_COUNT_REGEX = /(?:There are\s+)?(\d+)\s*(?:of a max of|\/)\s*(\d+)\s*(?:players online)?/i;
const JOIN_REGEX = /(?:UUID of player\s+([A-Za-z0-9_]{3,16})\s+is|\b([A-Za-z0-9_]{3,16})\b\s+(?:joined the game|connected|logged in))/i;
const LEAVE_REGEX = /\b([A-Za-z0-9_]{3,16})\b\s+(?:left the game|lost connection|disconnected|timed out|left)/i;

export interface OnlinePlayer {
    name: string;
    since: number;
}

/**
 * Tracks which players are currently online by parsing the live console stream.
 * Automatically sends 'list' when mounting and on demand.
 */
export default (counter = 0) => {
    const [players, setPlayers] = useState<Record<string, OnlinePlayer>>({});
    const status = ServerContext.useStoreState((state) => state.status.value);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const expectingNextLine = useRef<{ count: number; timestamp: number } | null>(null);

    // Clear roster when server stops
    useEffect(() => {
        if (status === 'offline' || status === 'stopping') {
            setPlayers({});
            expectingNextLine.current = null;
        }
    }, [status]);

    const refresh = useCallback(() => {
        if (connected && instance) {
            instance.send('send command', 'list');
        }
    }, [connected, instance]);

    // Send 'list' automatically when connected and running
    useEffect(() => {
        if (connected && instance && status === 'running') {
            const timer = window.setTimeout(() => {
                instance.send('send command', 'list');
            }, 500);
            return () => window.clearTimeout(timer);
        }
        return undefined;
    }, [connected, instance, status]);

    useEffect(() => {
        if (!connected || !instance) return;

        const handler = (raw: string) => {
            if (!raw) return;
            const line = clean(raw);
            if (!line) return;

            // 1. Check if we are waiting for player names on the line immediately following "There are X online:"
            if (expectingNextLine.current) {
                const elapsed = Date.now() - expectingNextLine.current.timestamp;
                if (elapsed < 3000) {
                    const tokens = line.split(/[, ]+/);
                    const names = tokens.map(extractPlayerName).filter(Boolean) as string[];
                    if (names.length > 0) {
                        setPlayers((prev) => {
                            const next: Record<string, OnlinePlayer> = {};
                            names.forEach((name) => {
                                next[name] = prev[name] ?? { name, since: counter || Date.now() };
                            });
                            return next;
                        });
                        expectingNextLine.current = null;
                        return;
                    }
                }
                expectingNextLine.current = null;
            }

            // 2. Check for "list" command output
            const countMatch = line.match(LIST_COUNT_REGEX);
            if (countMatch || /players online:?/i.test(line)) {
                const onlineCount = countMatch ? parseInt(countMatch[1], 10) : -1;

                if (onlineCount === 0) {
                    setPlayers({});
                    expectingNextLine.current = null;
                    return;
                }

                // Extract player list from rest of line (after colon if present)
                const colonIdx = line.indexOf(':');
                const restOfLine = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : '';

                if (restOfLine) {
                    const tokens = restOfLine.split(/[, ]+/);
                    const names = tokens.map(extractPlayerName).filter(Boolean) as string[];
                    if (names.length > 0) {
                        setPlayers((prev) => {
                            const next: Record<string, OnlinePlayer> = {};
                            names.forEach((name) => {
                                next[name] = prev[name] ?? { name, since: counter || Date.now() };
                            });
                            return next;
                        });
                        return;
                    }
                } else if (onlineCount > 0) {
                    // Next console line will contain player names (Paper/Purpur multi-line list)
                    expectingNextLine.current = { count: onlineCount, timestamp: Date.now() };
                    return;
                }
            }

            // 3. Track live Join events
            const joinMatch = line.match(JOIN_REGEX);
            if (joinMatch) {
                const name = joinMatch[1] || joinMatch[2];
                if (name && !['Server', 'CONSOLE', 'UUID'].includes(name)) {
                    setPlayers((prev) => (prev[name] ? prev : { ...prev, [name]: { name, since: counter || Date.now() } }));
                    return;
                }
            }

            // 4. Track live Leave events
            const leaveMatch = line.match(LEAVE_REGEX);
            if (leaveMatch) {
                const name = leaveMatch[1];
                if (name && !['Server', 'CONSOLE', 'UUID'].includes(name)) {
                    setPlayers((prev) => {
                        if (!prev[name]) return prev;
                        const next = { ...prev };
                        delete next[name];
                        return next;
                    });
                    return;
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
        refresh,
    };
};

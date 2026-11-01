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
 * rank prefixes or suffixes (e.g. "[Admin] Steve", "Alex (AFK)", "default: Notch", "*Herobrine").
 * Strictly rejects any token containing spaces, invalid characters, or blacklisted words.
 */
export const extractPlayerName = (token: string): string | null => {
    if (!token) return null;
    let s = token.trim();
    // Strip brackets like [Admin], [Mod], [VIP]
    s = s.replace(/\[[^\]]*\]/g, '').trim();
    // Strip parentheses like (AFK), (Guest)
    s = s.replace(/\([^)]*\)/g, '').trim();
    // Strip rank/group prefix like "default: Notch" or "Admin: Steve"
    s = s.replace(/^[a-zA-Z0-9_-]+:\s*/, '').trim();
    // Strip symbols like * ~ + -
    s = s.replace(/^[*~+-]+\s*/, '').trim();

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
// "There are 0 out of maximum 20 players online."
// "There are 1 of a max of 20 players online: Steve"
// "There are 2/20 players online: Steve, Alex"
// "There are 0 players online."
const LIST_HEADER_REGEX = /^There are (\d+)\s*(?:of a max(?:imum)?(?: of)?|out of maximum|\/)?\s*(\d+)?\s*players online\.?:?\s*(.*)$/i;

const JOIN_REGEX = /(?:UUID of player\s+([A-Za-z0-9_]{3,16})\s+is|\b([A-Za-z0-9_]{3,16})\b\s+(?:joined the game|connected|logged in))/i;
const LEAVE_REGEX = /\b([A-Za-z0-9_]{3,16})\b\s+(?:left the game|lost connection|disconnected|timed out)/i;

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

            // 1. If we are awaiting player list on the immediately following line (e.g. EssentialsX / Paper next-line roster)
            if (expectingNextLine.current) {
                const elapsed = Date.now() - expectingNextLine.current.timestamp;
                if (elapsed < 3000) {
                    // Split strictly by ',' (comma) - never split by spaces to guess player names!
                    const rawTokens = line.split(',');
                    const names = rawTokens
                        .map(extractPlayerName)
                        .filter((n): n is string => Boolean(n));

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

            // 2. Check for "There are X of Y players online"
            const listHeaderMatch = line.match(LIST_HEADER_REGEX);
            if (listHeaderMatch) {
                const count = parseInt(listHeaderMatch[1], 10);

                // If count === 0: immediately clear players and reset waiting ref! NEVER parse any words when count === 0!
                if (isNaN(count) || count === 0) {
                    setPlayers({});
                    expectingNextLine.current = null;
                    return;
                }

                // If count > 0:
                const trailing = listHeaderMatch[3]?.trim();
                if (trailing) {
                    // Split ONLY trailing by ',' (comma)
                    const rawTokens = trailing.split(',');
                    const names = rawTokens
                        .map(extractPlayerName)
                        .filter((n): n is string => Boolean(n));

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

                // If trailing is empty or yielded no names (e.g. EssentialsX prints players on the next line: "default: Steve, Alex")
                expectingNextLine.current = { count, timestamp: Date.now() };
                return;
            }

            // 3. Track live Join events
            const joinMatch = line.match(JOIN_REGEX);
            if (joinMatch) {
                const rawName = joinMatch[1] || joinMatch[2];
                const name = extractPlayerName(rawName);
                if (name) {
                    setPlayers((prev) => (prev[name] ? prev : { ...prev, [name]: { name, since: counter || Date.now() } }));
                    return;
                }
            }

            // 4. Track live Leave events
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

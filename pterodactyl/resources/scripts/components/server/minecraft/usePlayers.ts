import { useCallback, useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';

// eslint-disable-next-line no-control-regex
const ANSI = /\[[0-9;]*m/g;
const SECTION = /§[0-9a-fk-or]/gi;

const clean = (line: string): string =>
    line
        .replace(ANSI, '')
        .replace(SECTION, '')
        // Drop a leading "[12:34:56] [Server thread/INFO]:" style prefix.
        .replace(/^\[[^\]]*\]\s*(\[[^\]]*\]:?\s*)?/g, '')
        .trim();

const JOIN = /^([A-Za-z0-9_]{1,16}) joined the game/;
const LEAVE = /^([A-Za-z0-9_]{1,16}) (?:left the game|lost connection)/;
// Vanilla/Paper: "There are 2 of a max of 20 players online: Alice, Bob"
const LIST = /players online:\s*(.*)$/i;

export interface OnlinePlayer {
    name: string;
    since: number;
}

/**
 * Tracks which players are currently online by parsing the live console stream.
 * `refresh` sends the vanilla `list` command so the roster can be re-synced on demand
 * (for players that were already online before this page was opened).
 */
export default (counter = 0) => {
    const [players, setPlayers] = useState<Record<string, OnlinePlayer>>({});
    const status = ServerContext.useStoreState((state) => state.status.value);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);

    // Clear the roster whenever the server stops.
    useEffect(() => {
        if (status === 'offline' || status === 'stopping') {
            setPlayers({});
        }
    }, [status]);

    useEffect(() => {
        if (!connected || !instance) return;

        const handler = (raw: string) => {
            const line = clean(raw);

            const join = line.match(JOIN);
            if (join) {
                const name = join[1];
                setPlayers((prev) => (prev[name] ? prev : { ...prev, [name]: { name, since: counter } }));
                return;
            }

            const leave = line.match(LEAVE);
            if (leave) {
                const name = leave[1];
                setPlayers((prev) => {
                    if (!prev[name]) return prev;
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
                return;
            }

            const list = line.match(LIST);
            if (list) {
                const names = list[1]
                    .split(',')
                    .map((n) => n.trim())
                    .filter((n) => /^[A-Za-z0-9_]{1,16}$/.test(n));

                setPlayers((prev) => {
                    const next: Record<string, OnlinePlayer> = {};
                    names.forEach((name) => {
                        next[name] = prev[name] ?? { name, since: counter };
                    });
                    return next;
                });
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, handler);
        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, handler);
        };
    }, [connected, instance, counter]);

    const refresh = useCallback(() => {
        if (connected && instance) {
            instance.send('send command', 'list');
        }
    }, [connected, instance]);

    return {
        players: Object.values(players).sort((a, b) => a.name.localeCompare(b.name)),
        refresh,
    };
};

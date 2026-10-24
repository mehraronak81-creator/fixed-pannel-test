import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import { useTranslation } from 'react-i18next';
import styles from './style.module.css';
import { getEggBanner } from './eggBanner';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

export default ({ server }: { server: Server }) => {
    const { t } = useTranslation(['vantablack/utilities', 'vantablack/dashboard']);
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : t('unlimited');
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : t('unlimited');
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : t('unlimited');
    const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);
    const ipString = defaultAllocation ? `${defaultAllocation.alias || ip(defaultAllocation.ip)}:${defaultAllocation.port}` : 'n/a';

    const cpuPercent = server.limits.cpu > 0 && stats ? Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100) : 0;
    const memPercent = server.limits.memory > 0 && stats ? Math.min(100, (stats.memoryUsageInBytes / mbToBytes(server.limits.memory)) * 100) : 0;
    const diskPercent = server.limits.disk > 0 && stats ? Math.min(100, (stats.diskUsageInBytes / mbToBytes(server.limits.disk)) * 100) : 0;

    const statusLabel = stats?.status === 'running'
        ? t('online')
        : stats?.status === 'starting'
        ? t('starting')
        : stats?.status === 'stopping'
        ? t('stopping')
        : t('offline');

    return (
        <div className="liquid-glass p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-100 truncate">{server.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{ipString}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium border shrink-0 ${
                    stats?.status === 'running'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : stats?.status === 'starting'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : stats?.status === 'stopping'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                    {statusLabel}
                </span>
            </div>

            {/* Progress Bars for CPU/RAM/Disk matching Source 11 */}
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                <div>
                    <div className="flex justify-between mb-1">
                        <span>CPU</span>
                        <span className="font-mono text-gray-200">{stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, cpuPercent)}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block truncate">Max: {cpuLimit}</span>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span>RAM</span>
                        <span className="font-mono text-gray-200">{stats ? bytesToString(stats.memoryUsageInBytes) : '0 B'}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, memPercent)}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block truncate">Max: {memoryLimit}</span>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span>Disk</span>
                        <span className="font-mono text-gray-200">{stats ? bytesToString(stats.diskUsageInBytes) : '0 B'}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, diskPercent)}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block truncate">Max: {diskLimit}</span>
                </div>
            </div>

            <Link
                to={`/server/${server.id}`}
                className="mt-2 w-full py-2 bg-indigo-600/80 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
                Manage Server &rarr;
            </Link>
        </div>
    );
};

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
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + '%' : t('unlimited');
    const banner = getEggBanner(server);
    const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);
    const ipString = defaultAllocation ? `${defaultAllocation.alias || ip(defaultAllocation.ip)}:${defaultAllocation.port}` : 'n/a';

    const cpuPercent = server.limits.cpu > 0 && stats ? Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100) : 0;
    const memPercent = server.limits.memory > 0 && stats ? Math.min(100, (stats.memoryUsageInBytes / mbToBytes(server.limits.memory)) * 100) : 0;
    const diskPercent = server.limits.disk > 0 && stats ? Math.min(100, (stats.diskUsageInBytes / mbToBytes(server.limits.disk)) * 100) : 0;

    return (
        <div
            className={'liquid-glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex flex-col justify-between group relative overflow-hidden'}
        >
            {/* Ambient top light refraction */}
            <div className={'absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none'} />

            {/* Card Header: Server Name & Status Badge */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className={'min-w-0'}>
                    <p className="text-lg font-bold text-white tracking-wide truncate group-hover:text-indigo-200 transition-colors">
                        {server.name}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className={'px-2 py-0.5 rounded bg-black/40 border border-white/5'}>
                            {ipString}
                        </span>
                    </p>
                </div>

                {/* Status Badges */}
                <div className={'shrink-0'}>
                    {stats?.status === 'running' ? (
                        <span className={'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm'}>
                            <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />
                            {t('online')}
                        </span>
                    ) : stats?.status === 'starting' ? (
                        <span className={'bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse shadow-sm'}>
                            <span className={'w-2 h-2 rounded-full bg-amber-400'} />
                            {t('starting')}
                        </span>
                    ) : stats?.status === 'stopping' ? (
                        <span className={'bg-red-500/15 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm'}>
                            <span className={'w-2 h-2 rounded-full bg-red-400'} />
                            {t('stopping')}
                        </span>
                    ) : (
                        <span className={'bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm'}>
                            <span className={'w-2 h-2 rounded-full bg-rose-400'} />
                            {t('offline')}
                        </span>
                    )}
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className={'bg-black/25 rounded-xl p-3.5 border border-white/5 my-3 grid grid-cols-1 sm:grid-cols-3 gap-3'}>
                {/* CPU Metric */}
                <div>
                    <div className={'flex items-center justify-between text-xs mb-1'}>
                        <span className={'text-neutral-400 font-medium'}>CPU</span>
                        <span className={`font-mono font-semibold ${alarms.cpu ? 'text-rose-400' : 'text-neutral-200'}`}>
                            {stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0%'}
                        </span>
                    </div>
                    <div className={'h-1.5 w-full bg-white/5 rounded-full overflow-hidden'}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                alarms.cpu ? 'bg-rose-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, cpuPercent)}%` }}
                        />
                    </div>
                    <span className={'text-[10px] text-neutral-400 font-mono mt-0.5 block truncate'}>
                        Max: {cpuLimit}
                    </span>
                </div>

                {/* Memory Metric */}
                <div>
                    <div className={'flex items-center justify-between text-xs mb-1'}>
                        <span className={'text-neutral-400 font-medium'}>RAM</span>
                        <span className={`font-mono font-semibold ${alarms.memory ? 'text-rose-400' : 'text-neutral-200'}`}>
                            {stats ? bytesToString(stats.memoryUsageInBytes) : '0 B'}
                        </span>
                    </div>
                    <div className={'h-1.5 w-full bg-white/5 rounded-full overflow-hidden'}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                alarms.memory ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, memPercent)}%` }}
                        />
                    </div>
                    <span className={'text-[10px] text-neutral-400 font-mono mt-0.5 block truncate'}>
                        Max: {memoryLimit}
                    </span>
                </div>

                {/* Disk Metric */}
                <div>
                    <div className={'flex items-center justify-between text-xs mb-1'}>
                        <span className={'text-neutral-400 font-medium'}>Disk</span>
                        <span className={`font-mono font-semibold ${alarms.disk ? 'text-rose-400' : 'text-neutral-200'}`}>
                            {stats ? bytesToString(stats.diskUsageInBytes) : '0 B'}
                        </span>
                    </div>
                    <div className={'h-1.5 w-full bg-white/5 rounded-full overflow-hidden'}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                alarms.disk ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, diskPercent)}%` }}
                        />
                    </div>
                    <span className={'text-[10px] text-neutral-400 font-mono mt-0.5 block truncate'}>
                        Max: {diskLimit}
                    </span>
                </div>
            </div>

            {/* Action Bar */}
            <div className={'mt-3 pt-2'}>
                <Link
                    to={`/server/${server.id}`}
                    className={'w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/30 hover:border-indigo-400 flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-indigo-500/20'}
                >
                    <span>{t('manage-server', { ns: 'vantablack/dashboard'})}</span>
                    <span className={'group-hover:translate-x-1 transition-transform'}>&rarr;</span>
                </Link>
            </div>
        </div>
    );
};

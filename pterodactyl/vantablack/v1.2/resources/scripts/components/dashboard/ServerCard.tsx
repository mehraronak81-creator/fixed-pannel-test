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
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu} %` : t('unlimited');
    const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);
    const ipString = defaultAllocation ? `${defaultAllocation.alias || ip(defaultAllocation.ip)}:${defaultAllocation.port}` : 'n/a';

    return (
        <Link
            to={`/server/${server.id}`}
            className={'group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 px-4 sm:px-6 py-3.5 rounded-xl border border-white/[0.06] hover:border-red-500/40 transition-all duration-200 no-underline shadow-sm hover:shadow-lg'}
            style={{
                background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.08) 0%, rgba(13, 17, 28, 0.92) 28%, rgba(13, 17, 28, 0.98) 100%)',
                backdropFilter: 'blur(16px)',
            }}
        >
            {/* Left: Server Icon & Name */}
            <div className={'flex items-center gap-3.5 min-w-0 md:w-4/12'}>
                <div className={'w-9 h-9 rounded-lg bg-black/70 border border-white/10 flex items-center justify-center shrink-0 shadow-inner'}>
                    <svg className={'w-4 h-4 text-neutral-300'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'} strokeWidth={2.2}>
                        <path strokeLinecap={'round'} strokeLinejoin={'round'} d={'M4 6h16M4 12h16M4 18h16'} />
                    </svg>
                </div>
                <div className={'min-w-0 truncate'}>
                    <p className={'text-sm sm:text-base font-semibold text-white tracking-wide truncate group-hover:text-red-400 transition-colors'}>
                        {server.name}
                    </p>
                </div>
            </div>

            {/* Middle: IP / Allocation with Node Cloud Icon */}
            <div className={'flex items-center gap-2 text-neutral-400 text-xs font-mono shrink-0 md:w-3/12'}>
                <svg className={'w-4 h-4 text-neutral-500 shrink-0'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'} strokeWidth={2}>
                    <path strokeLinecap={'round'} strokeLinejoin={'round'} d={'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z'} />
                </svg>
                <span className={'truncate text-neutral-300'}>{ipString}</span>
            </div>

            {/* Right: CPU, RAM, Disk columns */}
            <div className={'flex items-center justify-between md:justify-end gap-6 sm:gap-10 shrink-0 md:w-5/12 w-full pt-2 md:pt-0 border-t md:border-t-0 border-white/5'}>
                {/* CPU Metric */}
                <div className={'text-left sm:text-right min-w-[70px]'}>
                    <div className={'flex items-center sm:justify-end gap-1.5 text-xs font-mono font-medium text-neutral-200'}>
                        <svg className={'w-3.5 h-3.5 text-neutral-400 shrink-0'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'} strokeWidth={2}>
                            <rect x={'4'} y={'4'} width={'16'} height={'16'} rx={'2'} />
                            <rect x={'9'} y={'9'} width={'6'} height={'6'} />
                            <path d={'M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3'} />
                        </svg>
                        <span className={alarms.cpu ? 'text-red-400 font-bold' : ''}>
                            {stats ? `${stats.cpuUsagePercent.toFixed(2)} %` : '0.00 %'}
                        </span>
                    </div>
                    <span className={'block text-[11px] text-neutral-500 font-mono sm:text-right mt-0.5'}>
                        of {cpuLimit}
                    </span>
                </div>

                {/* RAM Metric */}
                <div className={'text-left sm:text-right min-w-[75px]'}>
                    <div className={'flex items-center sm:justify-end gap-1.5 text-xs font-mono font-medium text-neutral-200'}>
                        <svg className={'w-3.5 h-3.5 text-neutral-400 shrink-0'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'} strokeWidth={2}>
                            <path strokeLinecap={'round'} strokeLinejoin={'round'} d={'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'} />
                        </svg>
                        <span className={alarms.memory ? 'text-red-400 font-bold' : ''}>
                            {stats ? bytesToString(stats.memoryUsageInBytes) : '0 Bytes'}
                        </span>
                    </div>
                    <span className={'block text-[11px] text-neutral-500 font-mono sm:text-right mt-0.5'}>
                        of {memoryLimit}
                    </span>
                </div>

                {/* Disk Metric */}
                <div className={'text-left sm:text-right min-w-[75px]'}>
                    <div className={'flex items-center sm:justify-end gap-1.5 text-xs font-mono font-medium text-neutral-200'}>
                        <svg className={'w-3.5 h-3.5 text-neutral-400 shrink-0'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'} strokeWidth={2}>
                            <path strokeLinecap={'round'} strokeLinejoin={'round'} d={'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'} />
                        </svg>
                        <span className={alarms.disk ? 'text-red-400 font-bold' : ''}>
                            {stats ? bytesToString(stats.diskUsageInBytes) : '0 Bytes'}
                        </span>
                    </div>
                    <span className={'block text-[11px] text-neutral-500 font-mono sm:text-right mt-0.5'}>
                        of {diskLimit}
                    </span>
                </div>
            </div>
        </Link>
    );
};

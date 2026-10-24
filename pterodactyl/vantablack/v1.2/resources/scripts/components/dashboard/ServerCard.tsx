import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerIcon, GlobeIcon, ChipIcon, DatabaseIcon, ArchiveIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

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

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : t('unlimited');
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : t('unlimited');
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : t('unlimited');
    const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);
    const ipString = defaultAllocation ? `${defaultAllocation.alias || ip(defaultAllocation.ip)}:${defaultAllocation.port}` : 'n/a';

    const isRunning = stats?.status === 'running';
    const isStarting = stats?.status === 'starting';

    return (
        <Link
            to={`/server/${server.id}`}
            className="liquid-glass px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-all relative overflow-hidden group w-full no-underline"
        >
            {/* Left Section: Server Icon Box + Server Name */}
            <div className="flex items-center gap-3.5 min-w-[200px] max-w-[280px] sm:max-w-xs shrink-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-neutral-300 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                    <ServerIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-white transition-colors">
                        {server.name}
                    </h3>
                    <span className="text-[11px] text-neutral-500 font-mono block truncate">
                        {server.node}
                    </span>
                </div>
            </div>

            {/* Middle Section: Server Allocation IP:Port */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-400 min-w-[160px] truncate">
                <GlobeIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{ipString}</span>
            </div>

            {/* Right Section: 3 Compact Columns with Icons */}
            <div className="flex items-center gap-5 sm:gap-7 pr-4">
                {/* 1. CPU */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-200">
                        <ChipIcon className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span>{stats ? `${stats.cpuUsagePercent.toFixed(2)} %` : '0.00 %'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                        of {cpuLimit}
                    </span>
                </div>

                {/* 2. RAM */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-200">
                        <DatabaseIcon className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span>{stats ? bytesToString(stats.memoryUsageInBytes) : '0 MiB'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                        of {memoryLimit}
                    </span>
                </div>

                {/* 3. Disk */}
                <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-200">
                        <ArchiveIcon className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span>{stats ? bytesToString(stats.diskUsageInBytes) : '0 MiB'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                        of {diskLimit}
                    </span>
                </div>
            </div>

            {/* Right-Edge Status Indicator Bar */}
            <div
                className={`absolute right-0 top-0 bottom-0 w-1.5 transition-all ${
                    isRunning
                        ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                        : isStarting
                        ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                        : 'bg-red-600 shadow-[0_0_10px_#dc2626]'
                }`}
            />
        </Link>
    );
};

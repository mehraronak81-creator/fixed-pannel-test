import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import { useTranslation } from 'react-i18next';
import styles from './style.module.css';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

const EGG_IMAGES: Record<string, string> = {
    minecraft: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
    rust: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/rust.png',
    valheim: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/valheim.png',
    terraria: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/terraria.png',
    csgo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/counter-strike-2.png',
    cs2: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/counter-strike-2.png',
    ark: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ark-survival-evolved.png',
};

const getEggIcon = (name: string, eggImage?: string | null): string | null => {
    if (eggImage) return eggImage;
    const lower = name.toLowerCase();
    for (const [key, url] of Object.entries(EGG_IMAGES)) {
        if (lower.includes(key)) return url;
    }
    return null;
};

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
    const eggIcon = getEggIcon(server.name, server.eggImage);
    
    return (
        <>
        <div className={`${styles.server_card} px-6 py-5`}>
            <div className="flex items-center justify-between">
                <div className={'flex items-center gap-3'}>
                    {eggIcon && (
                        <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-component overflow-hidden'} css={'background-color:color-mix(in srgb, var(--primary) 16%, transparent);'}>
                            <img src={eggIcon} alt="" className={'w-6 h-6 object-contain'} loading="lazy" />
                        </div>
                    )}
                    <div>
                        <p className="text-lg font-semibold text-gray-50">{server.name}</p>
                    </div>
                </div>
                <span className={`${styles.server_card_status} py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1.5
                    ${stats?.status === 'offline'
                        ? 'text-danger-50'
                        : stats?.status === 'running' 
                        ? 'text-success-50'
                        : stats?.status === 'starting' 
                        ? 'text-yellow-50 bg-yellow-500/40'
                        : stats?.status === 'stopping'
                        ? 'text-red-50 bg-red-500/40'
                        : ''
                    }
                `}
                css={`${stats?.status === 'offline'
                        ? 'background-color: color-mix(in srgb, var(--dangerBackground) 40%, transparent);'
                        : stats?.status === 'running'
                        ? 'background-color: color-mix(in srgb, var(--successBackground) 40%, transparent);'
                        : ''
                    }`}
                >
                    {stats?.status === 'running' && <span className={'w-1.5 h-1.5 rounded-full bg-success-50 animate-pulse'} />}
                    {stats?.status === 'offline' && <span className={'w-1.5 h-1.5 rounded-full bg-danger-50'} />}
                    {stats?.status === 'offline' 
                        ? t('offline')
                        : stats?.status === 'running'
                        ? t('online')
                        : stats?.status === 'starting'
                        ? t('starting')
                        : stats?.status === 'stopping'
                        ? t('stopping')
                        : ''
                    }
                </span>
            </div>
            <div className={`${styles.server_card_metrics} grid lg:grid-cols-2 gap-2 my-4`}>
                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-300 font-light">IP:</span>
                    {server.allocations
                        .filter((alloc) => alloc.isDefault)
                        .map((allocation) => (
                            <React.Fragment key={allocation.ip + allocation.port.toString()}>
                                {allocation.alias || ip(allocation.ip)}:{allocation.port}
                            </React.Fragment>
                        ))}
                </div>
                {!stats || isSuspended ? (
                    isSuspended ? (
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-300 font-light">{t('status')}:</span>
                            <span css={tw`bg-danger-200 rounded px-2 py-1 text-danger-50`}>
                                {server.status === 'suspended' ? t('suspended') : t('connection-error')}
                            </span>
                        </div>
                    ) : server.isTransferring || server.status ? (
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-300 font-light">{t('status')}:</span>
                            <span css={tw`bg-gray-400 rounded px-2 py-1 text-gray-200`}>
                                {server.isTransferring
                                    ? t('transferring')
                                    : server.status === 'installing'
                                    ? t('installing')
                                    : server.status === 'restoring_backup'
                                    ? t('restoring-backup')
                                    : t('unavailable')}
                            </span>
                        </div>
                    ) : (
                        <Spinner size={'small'} />
                    )
                ) : (
                <React.Fragment>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-300 font-light uppercase">{t('CPU')}:</span>
                        <p className={alarms.cpu ? 'text-danger-50' : ''}>{stats.cpuUsagePercent.toFixed(2)}%</p>
                        <span className="text-sm text-gray-300">/ {cpuLimit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-300 font-light">{t('memory')}:</span>
                        <p className={alarms.memory ? 'text-danger-50' : ''}>{bytesToString(stats.memoryUsageInBytes)}</p>
                        <span className="text-sm text-gray-300">/ {memoryLimit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-300 font-light">{t('disk')}:</span>
                        <p className={alarms.disk ? 'text-danger-50' : ''}>{bytesToString(stats.diskUsageInBytes)}</p>
                        <span className="text-sm text-gray-300">/ {diskLimit}</span>
                    </div>
                </React.Fragment>
                )}
            </div>
            <div className={styles.server_card_actions}>
                <Link to={`/server/${server.id}`} className={styles.server_card_primary}>
                    {t('manage-server', { ns: 'vantablack/dashboard'})}
                </Link>
            </div>
        </div>
        </>
    );
};

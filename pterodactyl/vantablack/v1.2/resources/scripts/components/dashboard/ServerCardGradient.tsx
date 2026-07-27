import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import { useTranslation } from 'react-i18next';
import styles from './style.module.css';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;
type Timer = ReturnType<typeof setInterval>;

export default ({ server }: { server: Server }) => {
    const { t } = useTranslation(['vantablack/utilities', 'vantablack/dashboard']);
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () => getServerResourceUsage(server.uuid).then(setStats).catch((requestError) => console.error(requestError));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => { interval.current = setInterval(getStats, 30000); });
        return () => { if (interval.current) clearInterval(interval.current); };
    }, [isSuspended]);

    const alarms = {
        cpu: !!stats && server.limits.cpu !== 0 && stats.cpuUsagePercent >= server.limits.cpu * 0.9,
        memory: !!stats && isAlarmState(stats.memoryUsageInBytes, server.limits.memory),
        disk: !!stats && server.limits.disk !== 0 && isAlarmState(stats.diskUsageInBytes, server.limits.disk),
    };
    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : t('unlimited');
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : t('unlimited');
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : t('unlimited');
    const currentStatus = isSuspended ? 'suspended' : stats?.status;
    const statusLabel = currentStatus === 'running' ? t('online')
        : currentStatus === 'offline' ? t('offline')
            : currentStatus === 'starting' ? t('starting')
                : currentStatus === 'stopping' ? t('stopping')
                    : server.isTransferring ? t('transferring')
                        : server.status === 'installing' ? t('installing')
                            : currentStatus ? t('unavailable') : '';

    return (
        <article className={styles.reference_card}>
            <div className={styles.reference_visual} css={`background-image:url(${server.eggImage || '/vantablack/minecraft-banner.png'})`}>
                <div className={styles.reference_overlay} />
                <div className={styles.reference_header}>
                    <p>{server.name}</p>
                    {currentStatus && (
                        <span className={`${styles.reference_status} ${currentStatus === 'running' ? styles.running : currentStatus === 'offline' || currentStatus === 'suspended' ? styles.offline : styles.pending}`}>
                            {statusLabel}
                        </span>
                    )}
                </div>
                <div className={styles.reference_metrics}>
                    <div><span>IP:</span>{server.allocations.filter((allocation) => allocation.isDefault).map((allocation) => <React.Fragment key={`${allocation.ip}:${allocation.port}`}>{allocation.alias || ip(allocation.ip)}:{allocation.port}</React.Fragment>)}</div>
                    {!stats || isSuspended ? (
                        <div><span>Status:</span><b className={styles.reference_status}>{statusLabel || t('connection-error')}</b></div>
                    ) : (
                        <div><span>CPU:</span><b className={alarms.cpu ? styles.alarm : undefined}>{stats.cpuUsagePercent.toFixed(2)}%</b> / {cpuLimit}</div>
                    )}
                    {stats && !isSuspended && <>
                        <div><span>RAM:</span><b className={alarms.memory ? styles.alarm : undefined}>{bytesToString(stats.memoryUsageInBytes)}</b> / {memoryLimit}</div>
                        <div><span>Disk:</span><b className={alarms.disk ? styles.alarm : undefined}>{bytesToString(stats.diskUsageInBytes)}</b> / {diskLimit}</div>
                    </>}
                </div>
            </div>
            <div className={styles.reference_actions}>
                <Link to={`/server/${server.id}`} className={styles.reference_manage}>{t('manage-server', { ns: 'vantablack/dashboard' })}</Link>
            </div>
        </article>
    );
};
import React, { useEffect, useMemo, useState } from 'react';
import { ChipIcon } from '@heroicons/react/outline';
import { LuSave, LuMemoryStick, LuTrendingUp } from "react-icons/lu";
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { useTranslation } from 'react-i18next';

type Stats = Record<'memory' | 'cpu' | 'disk', number>;

const ServerDetailsBlock = () => {
    const { t } = useTranslation('vantablack/utilities');
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : <>&infin;</>,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : <>&infin;</>,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : <>&infin;</>,
        }),
        [limits]
    );

    const cpuPercent = limits?.cpu ? Math.min(100, (stats.cpu / limits.cpu) * 100) : 0;
    const memPercent = limits?.memory ? Math.min(100, (stats.memory / mbToBytes(limits.memory)) * 100) : 0;
    const diskPercent = limits?.disk ? Math.min(100, (stats.disk / mbToBytes(limits.disk)) * 100) : 0;

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
        });
    });

    return (
        <>
        <div className={'grid md:grid-cols-3 gap-4'}>
            <div className={'bg-gray-700 backdrop rounded-box px-6 py-5 flex justify-between items-center border border-transparent hover:border-gray-500 duration-300 group'}>
                <div className={'flex-1'}>
                    <span className={'text-gray-300 text-sm'}>{t('cpu-usage')}:</span>
                    <div className={'flex items-center gap-x-1'}>
                        {status === 'offline' ? (
                            <p>{t('offline')}</p>
                        ) : (
                            <p className={'text-lg font-medium text-gray-50'}>{stats.cpu.toFixed(2)}%</p>
                        )}
                        <span className={'text-gray-300 font-medium text-sm'}>/ {textLimits.cpu}</span>
                    </div>
                    {status !== 'offline' && limits?.cpu ? (
                        <div className={'mt-2 h-1.5 w-full rounded-full bg-gray-600 overflow-hidden'}>
                            <div className={'h-full rounded-full duration-500 ease-out'} css={`width:${cpuPercent}%; background:${cpuPercent > 90 ? 'var(--dangerBackground)' : 'var(--primary)'};`} />
                        </div>
                    ) : null}
                </div>
                <div className={'text-white bg-vantablack rounded-component w-14 h-14 flex items-center justify-center ml-4 shrink-0 group-hover:scale-105 duration-300'}>
                    <ChipIcon className={'w-8'}/>
                </div>
            </div>
            <div className={'bg-gray-700 backdrop rounded-box px-6 py-5 flex justify-between items-center border border-transparent hover:border-gray-500 duration-300 group'}>
                <div className={'flex-1'}>
                    <span className={'text-gray-300 text-sm'}>{t('memory-usage')}:</span>
                    <div className={'flex items-center gap-x-1'}>
                        <p className={'text-lg font-medium text-gray-50'}>{bytesToString(stats.memory)}</p>
                        <span className={'text-gray-300 font-medium text-sm'}>/ {textLimits.memory}</span>
                    </div>
                    {limits?.memory ? (
                        <div className={'mt-2 h-1.5 w-full rounded-full bg-gray-600 overflow-hidden'}>
                            <div className={'h-full rounded-full duration-500 ease-out'} css={`width:${memPercent}%; background:${memPercent > 90 ? 'var(--dangerBackground)' : 'var(--primary)'};`} />
                        </div>
                    ) : null}
                </div>
                <div className={'text-white bg-vantablack rounded-component w-14 h-14 flex items-center justify-center ml-4 shrink-0 group-hover:scale-105 duration-300'}>
                    <LuMemoryStick className={'text-[2rem]'}/>
                </div>
            </div>
            <div className={'bg-gray-700 backdrop rounded-box px-6 py-5 flex justify-between items-center border border-transparent hover:border-gray-500 duration-300 group'}>
                <div className={'flex-1'}>
                    <span className={'text-gray-300 text-sm'}>{t('disk-usage')}:</span>
                    <div className={'flex items-center gap-x-1'}>
                        <p className={'text-lg font-medium text-gray-50'}>{bytesToString(stats.disk)}</p>
                        <span className={'text-gray-300 font-medium text-sm'}>/ {textLimits.disk}</span>
                    </div>
                    {limits?.disk ? (
                        <div className={'mt-2 h-1.5 w-full rounded-full bg-gray-600 overflow-hidden'}>
                            <div className={'h-full rounded-full duration-500 ease-out'} css={`width:${diskPercent}%; background:${diskPercent > 90 ? 'var(--dangerBackground)' : 'var(--primary)'};`} />
                        </div>
                    ) : null}
                </div>
                <div className={'text-white bg-vantablack rounded-component w-14 h-14 flex items-center justify-center ml-4 shrink-0 group-hover:scale-105 duration-300'}>
                    <LuSave className={'text-[2rem]'}/>
                </div>
            </div>
        </div>
        </>
    );
};

export default ServerDetailsBlock;

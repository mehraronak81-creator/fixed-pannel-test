import React, { useEffect, useState, useMemo } from 'react';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import PowerButtons from '@/components/server/console/PowerButtons';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { GlobeIcon, ChipIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { LuSave, LuMemoryStick } from "react-icons/lu";
import styled from 'styled-components/macro';
import Can from '@/components/elements/Can';
import { SubNavigationLinks } from '@/routers/RouterElements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

const commonLinkStyles = tw`p-2 rounded duration-300`;

const NavigationLinks = styled.div`
    ${tw`mx-auto w-full lg:flex hidden items-center gap-x-6 max-w-[1200px] mt-2`};

    .dropdown {
        ${tw`relative flex items-center gap-x-1 text-gray-200 duration-300 cursor-pointer`};

        & > span {
            ${tw`relative flex items-center gap-x-1 text-gray-200 duration-300 cursor-pointer p-2`};

            & > svg {
                ${tw`duration-300`}
            }
        }

        & > div {
            ${tw`absolute top-[100%] left-0 flex-col gap-1 p-2 bg-gray-600 border-gray-500 z-[99] min-w-[150px] rounded opacity-0 pointer-events-none duration-300`};

            & > a {
                ${commonLinkStyles};

                &:hover,
                &:focus {
                    ${tw`bg-gray-500`};
                }

                &.active {
                    ${tw`text-gray-100 bg-gray-500`};

                    & > svg {
                        ${tw`text-gray-50`};
                    }
                }
            }
        }

        &:hover {
            ${tw`text-gray-100`}

            & > span > svg {
                transform: rotate(180deg);
            }

            & > div {
                ${tw`opacity-100 pointer-events-auto`}
            }
        }
    }

    a {
        ${tw`flex gap-x-1 items-center text-gray-200 duration-300`};

        & > svg {
            ${tw`text-gray-300 duration-300`};
        }

        &:hover,
        &:focus {
            ${tw`text-gray-100`};

            & > svg {
                ${tw`text-gray-200`};
            }
        }
    }

    & > a {
        ${tw`p-2 relative border-b-[2px] border-transparent z-10`};

        &::after {
            ${tw`absolute inset-0 z-[-1] opacity-0 duration-300 top-[100%]`}
            content: '';
            background: linear-gradient(180deg, color-mix(in srgb, var(--gray700) 0%, transparent) 0%, color-mix(in srgb, var(--primary) 30%, transparent) 100%);
        }

        &.active {
            ${tw`text-gray-50 border-vantablack`}

            & > svg {
                ${tw`text-vantablack`};
            }

            &::after {
                ${tw`opacity-100 top-[0]`}
            }
        }
    }
`;

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime', number>;

const SubNavigation = () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0 });
    const [toggleStats, setToggleStats] = useState<boolean>(false);

    const { t } = useTranslation(['vantablack/utilities', 'vantablack/navigation']);

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const layout = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.layout);

    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : <>&infin;</>,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : <>&infin;</>,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : <>&infin;</>,
        }),
        [limits]
    );
    
    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data?.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

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
            uptime: stats.uptime || 0,
        });
    });

    return(
        <div className={`relative px-4 z-10 ${layout == 3 ? 'bg-gray-700 backdrop !border-t-0 !border-r-0 !border-l-0' : 'pt-2'}`}>
            <div className={`mx-auto w-full md:flex items-center justify-between max-w-[1200px] ${layout == 3 ? 'border-t border-gray-500 lg:pt-6 py-5' : 'bg-gray-700 backdrop px-6 py-5 rounded-box'}`}>
                <div>
                    <div className={'flex items-center gap-x-3'}>
                        <p className={'text-lg font-semibold text-gray-50'}>{name}</p>
                        <span className={`py-1 px-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border
                            ${status === 'offline'
                                ? 'text-red-400 bg-red-500/10 border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                : status === 'running' 
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : status === 'starting' 
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : status === 'stopping'
                                ? 'text-red-400 bg-red-500/10 border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                : 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
                            }
                        `}>
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    status === 'running' ? 'bg-emerald-400' : status === 'starting' ? 'bg-amber-400' : 'bg-red-400'
                                }`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                    status === 'running'
                                        ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                                        : status === 'starting'
                                        ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                                        : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                                }`} />
                            </span>
                            {status === 'offline' 
                                ? t('offline')
                                : status === 'running'
                                ? t('online')
                                : status === 'starting'
                                ? t('starting')
                                : status === 'stopping'
                                ? t('stopping')
                                : 'Connecting...'
                            }
                        </span>
                    </div>
                    <div className={`md:flex flex-wrap gap-x-5 mt-2 overflow-hidden md:max-h-[100vh] duration-300 ${toggleStats ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <CopyOnClick text={allocation}>
                            <div className={'flex items-center gap-x-1 py-1'}>
                                <GlobeIcon className={'w-5 text-gray-300'} />
                                {allocation}
                            </div>
                        </CopyOnClick>
                        <div className={'flex items-center gap-x-1 py-1'}>
                            <ChipIcon className={'w-5 text-gray-300'} />
                            {status !== 'offline' ? 
                                <span>{stats.cpu.toFixed(2)}%</span>
                            : '0%' }
                            <span className={'text-sm text-gray-300'}>/ {textLimits.cpu}</span>
                        </div>
                        <div className={'flex items-center gap-x-1'}>
                            <LuMemoryStick className={'w-5 text-[2rem] text-gray-300'} />
                            {status !== 'offline' ? 
                                <span>{bytesToString(stats.memory)}</span>
                            : '0 GiB' }
                            <span className={'text-sm text-gray-300'}>/ {textLimits.memory}</span>
                        </div>
                        <div className={'flex items-center gap-x-1'}>
                            <LuSave className={'w-5 text-[2rem] text-gray-300'} />
                            <span>{bytesToString(stats.disk)}</span>
                            <span className={'text-sm text-gray-300'}>/ {textLimits.disk}</span>
                        </div>
                    </div>
                    <div className={'md:hidden flex items-center gap-x-1 text-gray-300 cursor-pointer'} onClick={() => setToggleStats(!toggleStats)}>
                        <span>Server stats</span>
                        <ChevronDownIcon className={`w-4 duration-300 ${toggleStats ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                    <PowerButtons className="md:grid grid-cols-3 gap-2 hidden" />
                    <PowerButtons icons className="md:hidden grid-cols-3 gap-2 grid mt-5 pt-5 md:border-t-0 border-t-[2px] border-gray-500" />
                </Can>
            </div>
            {layout == 3 &&
            <NavigationLinks>
                <SubNavigationLinks />
                {rootAdmin && (
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a href={`/admin/servers/view/${serverId}`} target={'_blank'}>
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> {t('admin-view', { ns: 'vantablack/navigation' })}
                    </a>
                )}
            </NavigationLinks>}
        </div>
    )
}
export default SubNavigation;
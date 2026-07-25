import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import getServers from '@/api/getServers';
import ServerCard from '@/components/dashboard/ServerCard';
import ServerCardBanner from '@/components/dashboard/ServerCardBanner';
import ServerCardGradient from '@/components/dashboard/ServerCardGradient';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { LuArrowUpRight, LuChevronRight, LuCreditCard, LuLifeBuoy, LuRouter, LuServer, LuSettings2, LuShieldCheck } from "react-icons/lu";
import { RxDiscordLogo } from "react-icons/rx";
import { FaDiscord } from "react-icons/fa";
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('vantablack/dashboard');
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [guildData, setGuildData] = useState<{ instant_invite: string, presence_count: number } | null>(null);

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const discordBox = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.discordBox);
    const discord = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.discord);
    const billing = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.billing);
    const support = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.support);
    const status = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.status);
    const socialButtons = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.socialButtons);
    const serverRow = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.serverRow);
    const discordInvite = guildData?.instant_invite || support || 'https://discord.gg/2vx6tCXmr4';

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    useEffect(() => {
        if (!discord || discord === 'none') return;

        const fetchData = async () => {
            try {
                const response = await fetch(`https://discord.com/api/guilds/${discord}/widget.json`);

                if (!response.ok) {
                    throw new Error('Failed to fetch guild data');
                }

            const data = await response.json();
                setGuildData(data);
            } catch (error) {
                console.error('Error fetching guild data:', error);
            }
        };

        fetchData();
    }, [discord]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <section className={'relative mb-6 overflow-hidden rounded-box border border-gray-500 bg-gray-700 p-6 backdrop shadow-2xl'}>
                <div className={'pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl'} css={'background:var(--primary);'} />
                <div className={'relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end'}>
                    <div>
                        <p className={'mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-vantablack'}>VantaHost command center</p>
                        <h1 className={'text-3xl font-semibold tracking-tight text-gray-50 sm:text-4xl'}>Welcome back, {username}</h1>
                        <p className={'mt-2 max-w-2xl text-sm text-gray-300'}>Everything you need to keep your game servers fast, healthy, and under control.</p>
                        <div className={'mt-5 flex flex-wrap gap-2'}>
                            <Link to={'/account'} className={'group flex items-center gap-2 rounded-component bg-vantablack px-4 py-2 text-sm font-semibold text-white duration-200 hover:brightness-110'}>
                                <LuSettings2 className={'w-4'} /> Account settings <LuArrowUpRight className={'w-4 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'} />
                            </Link>
                            {rootAdmin && <Link to={'/admin'} className={'flex items-center gap-2 rounded-component border border-gray-500 px-4 py-2 text-sm font-semibold text-gray-200 duration-200 hover:border-vantablack hover:text-gray-50'}>
                                <LuShieldCheck className={'w-4'} /> Admin control
                            </Link>}
                        </div>
                    </div>
                    <div className={'grid min-w-[260px] grid-cols-2 gap-2'}>
                        <div className={'rounded-component border border-gray-500 bg-gray-800 p-3'}>
                            <LuServer className={'mb-3 w-5 text-vantablack'} />
                            <p className={'text-2xl font-semibold text-gray-50'}>{servers?.pagination.total ?? '-'}</p>
                            <span className={'text-xs text-gray-300'}>Accessible servers</span>
                        </div>
                        <div className={'rounded-component border border-gray-500 bg-gray-800 p-3'}>
                            <LuShieldCheck className={'mb-3 w-5 text-success-100'} />
                            <p className={'text-2xl font-semibold text-gray-50'}>24/7</p>
                            <span className={'text-xs text-gray-300'}>Control ready</span>
                        </div>
                    </div>
                </div>
            </section>
            {String(socialButtons) == 'true' &&
            <div className={'flex lg:gap-4 gap-2 lg:flex-row flex-col mb-4'}>
                {discord &&
                    <a href={discordInvite} target="_blank" rel="noopener noreferrer" className={'group w-full bg-gray-700 backdrop rounded-box flex items-center justify-between px-6 py-5'}>
                        <div>
                            <p className={'font-medium text-gray-100 flex items-center'}>
                                Discord
                                <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                            </p>
                            <span className={'font-light text-sm text-gray-200'}>{t('join-our-discord')}</span>
                        </div>
                        <RxDiscordLogo className={'text-[2.5rem] text-vantablack'}/>
                    </a>
                }
                {billing &&
                    <a href={billing} target="_blank" rel="noopener noreferrer" className={'group w-full bg-gray-700 backdrop rounded-box flex items-center justify-between px-6 py-5'}>
                        <div>
                            <p className={'font-medium text-gray-100 flex items-center'}>
                                {t('billing-area')}
                                <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                            </p>
                            <span className={'font-light text-sm text-gray-200'}>{t('manage-your-services')}</span>
                        </div>
                        <LuCreditCard className={'text-[2.5rem] text-vantablack'}/>
                    </a>
                }
                {support &&
                    <a href={support} target="_blank" rel="noopener noreferrer" className={'group w-full bg-gray-700 backdrop rounded-box flex items-center justify-between px-6 py-5'}>
                        <div>
                            <p className={'font-medium text-gray-100 flex items-center'}>
                                {t('supportcenter')}
                                <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                            </p>
                            <span className={'font-light text-sm text-gray-200'}>{t('get-support')}</span>
                        </div>
                        <LuLifeBuoy className={'text-[2.5rem] text-vantablack'}/>
                    </a>
                }
                {status &&
                    <a href={status} target="_blank" rel="noopener noreferrer" className={'group w-full bg-gray-700 backdrop rounded-box flex items-center justify-between px-6 py-5'}>
                        <div>
                    <p className={'font-medium text-gray-100 flex items-center'}>
                                {t('server-status')}
                                <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                            </p>
                            <span className={'font-light text-sm text-gray-200'}>{t('check-server-status')}</span>
                        </div>
                        <LuRouter className={'text-[2.5rem] text-vantablack'}/>
                    </a>
                }
            </div>}
            <div className={'flex gap-4 md:flex-nowrap flex-wrap mb-6'}>
                <div className={'bg-gray-700 backdrop rounded-box px-6 py-5 w-full flex items-center justify-between'}>
                    <div>
                        <p className={'text-gray-50'}>{t('welcome-back')}</p>
                        <p className={'font-light'}>{t('all-servers-you-have-access-to')}</p>
                    </div>
                    {rootAdmin && (
                        <div css={tw`flex justify-end items-center`}>
                            <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                                {showOnlyAdmin ? t('others-servers') : t('your-servers')}
                            </p>
                            <Switch
                                name={'show_all_servers'}
                                defaultChecked={showOnlyAdmin}
                                onChange={() => setShowOnlyAdmin((s) => !s)}
                            />
                        </div>
                    )}
                </div>
                {String(discordBox) == 'true' &&
                <a href={discordInvite} target="_blank" rel="noopener noreferrer" className={'group lg:max-w-[275px] w-full border border-[#6374AC] hover:border-[#97A8E0] rounded-box flex items-center justify-between px-6 py-5 duration-300'} css={'background-image:radial-gradient(circle, rgba(27,43,104,1) 0%, rgba(9,39,78,1) 100%);'}>
                    <div>
                        <span className={'font-light text-sm text-white/70'}>{guildData ? guildData.presence_count : '000'} {t('members-online')}</span>
                        <p className={'font-medium text-white'}>{t('join-our-discord')}</p>
                    </div>
                    <FaDiscord className={'text-[2.5rem] text-white/70 group-hover:text-white duration-300'}/>
                </a>}
            </div>
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                    <Pagination data={servers} onPageSelect={setPage}>
                            {({ items }) =>
                                items.length > 0 ? (
                                    items.map((server, index) => (
                                        serverRow == 1 
                                            ? <ServerCardGradient key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                                            : serverRow == 2
                                            ? <ServerCardBanner key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                                            : serverRow == 3
                                            && <ServerCard key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                                    ))
                                ) : (
                                    <p css={tw`text-center text-sm text-neutral-400 lg:col-span-2 col-span-1`}>
                                        {showOnlyAdmin
                                            ? t('there-are-no-servers')
                                            : t('there-are-no-servers-associated')}
                                    </p>
                                )
                            }
                    </Pagination>
                </div>
            )}
        </PageContentBlock>
    );
};

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
import useSWR from 'swr';
import { LuArrowUpRight, LuChevronRight, LuCreditCard, LuLifeBuoy, LuRouter, LuServer, LuSettings2, LuShieldCheck } from 'react-icons/lu';
import { RxDiscordLogo } from 'react-icons/rx';
import { FaDiscord } from 'react-icons/fa';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './style.module.css';

export default () => {
    const { t } = useTranslation('vantablack/dashboard');
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [guildData, setGuildData] = useState<{ instant_invite: string; presence_count: number } | null>(null);

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
        if (servers && servers.pagination.currentPage > 1 && !servers.items.length) setPage(1);
    }, [servers?.pagination.currentPage, servers?.items.length]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    useEffect(() => {
        if (!discord || discord === 'none') return;

        fetch(`https://discord.com/api/guilds/${discord}/widget.json`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch guild data');
                return response.json();
            })
            .then((data) => setGuildData(data))
            .catch((requestError) => console.error('Error fetching guild data:', requestError));
    }, [discord]);

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
    const showDiscordWidget = String(discordBox) === 'true' && discord !== 'none';

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <section className={styles.welcome_row}>
                <div className={styles.welcome_card}>
                    <div className={styles.welcome_copy}>
                        <span className={styles.eyebrow}>{greeting}</span>
                        <h1>Welcome back, <span>{username}</span></h1>
                        <p>Here you can see all the servers you have access to and jump straight into the tools you need.</p>
                        <div className={styles.welcome_actions}>
                            <Link to={'/account'} className={styles.account_link}>
                                <LuSettings2 className={'w-4'} /> Account settings <LuArrowUpRight className={'w-4'} />
                            </Link>
                            {rootAdmin && (
                                <Link to={'/admin'} className={styles.admin_link}>
                                    <LuShieldCheck className={'w-4'} /> Admin control
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className={styles.server_total} aria-label={`${servers?.pagination.total ?? 0} servers available`}>
                        <LuServer className={'w-5'} />
                        <strong>{servers?.pagination.total ?? '-'}</strong>
                        <span>Servers available</span>
                    </div>
                </div>

                {showDiscordWidget && (
                    <a href={discordInvite} target={'_blank'} rel={'noopener noreferrer'} className={styles.discord_card}>
                        <div>
                            <span>{guildData ? guildData.presence_count : '—'} {t('members-online')}</span>
                            <p>{t('join-our-discord')}</p>
                        </div>
                        <FaDiscord className={styles.discord_icon} />
                    </a>
                )}
            </section>

            {String(socialButtons) === 'true' && (
                <section className={styles.quick_links} aria-label={'Helpful links'}>
                    {discord && discord !== 'none' && !showDiscordWidget && (
                        <a href={discordInvite} target={'_blank'} rel={'noopener noreferrer'} className={styles.quick_link}>
                            <RxDiscordLogo className={styles.quick_link_icon} />
                            <div><p>Discord</p><span>{t('join-our-discord')}</span></div><LuChevronRight className={'ml-auto w-4'} />
                        </a>
                    )}
                    {billing && (
                        <a href={billing} target={'_blank'} rel={'noopener noreferrer'} className={styles.quick_link}>
                            <LuCreditCard className={styles.quick_link_icon} />
                            <div><p>{t('billing-area')}</p><span>{t('manage-your-services')}</span></div><LuChevronRight className={'ml-auto w-4'} />
                        </a>
                    )}
                    {support && (
                        <a href={support} target={'_blank'} rel={'noopener noreferrer'} className={styles.quick_link}>
                            <LuLifeBuoy className={styles.quick_link_icon} />
                            <div><p>{t('supportcenter')}</p><span>{t('get-support')}</span></div><LuChevronRight className={'ml-auto w-4'} />
                        </a>
                    )}
                    {status && (
                        <a href={status} target={'_blank'} rel={'noopener noreferrer'} className={styles.quick_link}>
                            <LuRouter className={styles.quick_link_icon} />
                            <div><p>{t('server-status')}</p><span>{t('check-server-status')}</span></div><LuChevronRight className={'ml-auto w-4'} />
                        </a>
                    )}
                </section>
            )}

            <section className={styles.server_section}>
                <div className={styles.server_heading}>
                    <div>
                        <p>Your servers</p>
                        <span>{t('all-servers-you-have-access-to')}</span>
                    </div>
                    {rootAdmin && (
                        <div className={styles.server_filter}>
                            <span>{showOnlyAdmin ? t('others-servers') : t('your-servers')}</span>
                            <Switch
                                name={'show_all_servers'}
                                defaultChecked={showOnlyAdmin}
                                onChange={() => setShowOnlyAdmin((value) => !value)}
                            />
                        </div>
                    )}
                </div>

                {!servers ? (
                    <Spinner centered size={'large'} />
                ) : (
                    <div className={styles.server_grid}>
                        <Pagination data={servers} onPageSelect={setPage}>
                            {({ items }) => items.length > 0 ? (
                                items.map((server) => (
                                    serverRow === 1 ? <ServerCardGradient key={server.uuid} server={server} />
                                        : serverRow === 2 ? <ServerCardBanner key={server.uuid} server={server} />
                                            : <ServerCard key={server.uuid} server={server} />
                                ))
                            ) : (
                                <p className={styles.empty_state}>
                                    {showOnlyAdmin ? t('there-are-no-servers') : t('there-are-no-servers-associated')}
                                </p>
                            )}
                        </Pagination>
                    </div>
                )}
            </section>
        </PageContentBlock>
    );
};
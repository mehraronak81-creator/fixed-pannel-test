import React, { useEffect } from 'react';
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
import { LuChevronRight, LuCreditCard, LuFolderPlus, LuLifeBuoy, LuRouter } from 'react-icons/lu';
import { RxDiscordLogo } from 'react-icons/rx';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './style.module.css';

export default () => {
    const { t } = useTranslation('vantablack/dashboard');
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = React.useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const discord = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.discord);
    const billing = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.billing);
    const support = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.support);
    const status = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.status);
    const socialButtons = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.socialButtons);
    const serverRow = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.serverRow);
    const discordInvite = support || 'https://discord.gg/2vx6tCXmr4';

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

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div className={styles.breadcrumb_bar}>
                <span>Home</span>
                <span className={styles.breadcrumb_separator}>/</span>
                <button type={'button'} className={styles.create_folder} title={'Folder organization is available when the panel folder extension is enabled'}>
                    Create folder <LuFolderPlus className={'w-4'} />
                </button>
                {rootAdmin && (
                    <div className={styles.admin_filter}>
                        <span>{showOnlyAdmin ? t('others-servers') : t('your-servers')}</span>
                        <Switch name={'show_all_servers'} defaultChecked={showOnlyAdmin} onChange={() => setShowOnlyAdmin((value) => !value)} />
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

            {String(socialButtons) === 'true' && (
                <section className={styles.quick_links} aria-label={'Helpful links'}>
                    {discord && discord !== 'none' && (
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
        </PageContentBlock>
    );
};
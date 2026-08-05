import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import SideGraphs from '@/components/server/console/SideGraphs';
import Can from '@/components/elements/Can';
import { ArchiveIcon, CalendarIcon, CubeTransparentIcon, EyeIcon, FolderOpenIcon, TerminalIcon, ViewGridIcon, UsersIcon, GlobeIcon } from '@heroicons/react/outline';
import Sftp from '@/components/server/dashboard/SFTP';
import Banner from '@/components/server/dashboard/Banner';
import InfoCardAdvanced from '@/components/server/dashboard/InfoCardAdvanced';
import InfoCard from '@/components/server/dashboard/InfoCard';
import { useTranslation } from 'react-i18next';
import Console from '@/components/server/console/Console';
import { LuArrowUpRight } from 'react-icons/lu';
import styles from './premium.module.css';

interface QuickActionProps {
    href: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const QuickAction = ({ href, label, description, icon: Icon }: QuickActionProps) => (
    <Link to={href} className={styles.quickAction}>
        <div className={styles.quickActionIcon}>
            <Icon className={'w-5'} />
        </div>
        <div className={'min-w-0'}>
            <p className={styles.quickActionLabel}>{label}</p>
            <p className={styles.quickActionDescription}>{description}</p>
        </div>
        <LuArrowUpRight className={styles.quickActionArrow} />
    </Link>
);

interface Props {
    type: string;
}

const Component = ({ type }: Props) => {
    return  type == 'banner'
            ? <Banner />

            : type == 'statCards'
            ? <div className={'lg:col-span-2'}>
                <ServerDetailsBlock />
              </div>
            
            : type == 'graphs'
            ? <div className={'lg:col-span-2 grid lg:grid-cols-3 gap-4'}>
                <StatGraphs />
              </div>
            
            : type == 'sideGraphs' 
            ? <div className={'col-span-1 row-span-2'}>
                <div className={'w-full flex flex-col gap-4'}>
                    <SideGraphs />
                </div>
              </div>
            
            : type == 'SFTP'
            ? <Sftp />
            
            : type == 'info'
            ? <InfoCard />

            : type == 'infoAdvanced'
            ? <InfoCardAdvanced />
            : null
}


const DashboardContainer = () => {
    const { t } = useTranslation('vantablack/server/dashboard');
    const match = useRouteMatch();
    const serverPath = match.url.replace(/\/$/, '');
    const toolPath = (path: string) => `${serverPath}/${path}`;
    const slot1 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot1);
    const slot2 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot2);
    const slot3 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot3);
    const slot4 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot4);
    const slot5 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot5);
    const slot6 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot6);
    const slot7 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot7);

    return(
        <ServerContentBlock title={t('dashboard')} icon={ViewGridIcon}>
            {/* Live console embed */}
            <section className={styles.consolePreview}>
                <div className={styles.consolePreviewHeader}>
                    <div className={'flex items-center gap-3'}>
                        <div css={'background-color:color-mix(in srgb, var(--primary) 20%, transparent);'} className={'flex h-10 w-10 items-center justify-center rounded-component text-vantablack'}>
                            <TerminalIcon className={'w-5'} />
                        </div>
                        <div>
                            <p className={'font-semibold text-gray-50'}>Live console</p>
                            <p className={'text-xs text-gray-300'}>Monitor output and send commands without leaving your dashboard.</p>
                        </div>
                    </div>
                    <Link to={toolPath('console')} className={styles.consoleLink}>
                        Open full console
                        <LuArrowUpRight className={'w-4 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'} />
                    </Link>
                </div>
                <div className={styles.consolePreviewBody}>
                    <Console />
                </div>
            </section>

            {/* Quick actions */}
            <section className={styles.quickActions}>
                <div className={styles.quickActionsHeader}>
                    <div>
                        <p className={'font-semibold text-gray-50'}>Command center</p>
                        <p className={'text-xs text-gray-300'}>Jump straight into the tools you use most.</p>
                    </div>
                    <span className={styles.quickActionsBadge}>WORKSPACE</span>
                </div>
                <div className={styles.quickActionsGrid}>
                    <Can action={'file.*'}><QuickAction href={toolPath('files')} label={'File manager'} description={'Upload and edit files'} icon={FolderOpenIcon} /></Can>
                    <Can action={'backup.*'}><QuickAction href={toolPath('backups')} label={'Backups'} description={'Protect server data'} icon={ArchiveIcon} /></Can>
                    <Can action={'schedule.*'}><QuickAction href={toolPath('schedules')} label={'Schedules'} description={'Automate commands'} icon={CalendarIcon} /></Can>
                    <Can action={'activity.*'}><QuickAction href={toolPath('activity')} label={'Activity log'} description={'Review server events'} icon={EyeIcon} /></Can>
                    <Can action={'allocation.*'}><QuickAction href={toolPath('network')} label={'Network'} description={'Manage allocations'} icon={GlobeIcon} /></Can>
                    <Can action={'user.*'}><QuickAction href={toolPath('users')} label={'Subusers'} description={'Manage user access'} icon={UsersIcon} /></Can>
                    <Can action={'file.*'}><QuickAction href={toolPath('minecraft')} label={'Minecraft manager'} description={'Players, world, and server rules'} icon={CubeTransparentIcon} /></Can>
                </div>
            </section>
            {/* Configurable component slots */}
            <div className={'grid lg:grid-cols-2 grid-cols-1 gap-4'}>
                <Component type={slot1} />
                <Component type={slot2} />
                <Component type={slot3} />
                <Component type={slot4} />
                <Component type={slot5} />
                <Component type={slot6} />
                <Component type={slot7} />
            </div>
        </ServerContentBlock>
    )
}

export default DashboardContainer;

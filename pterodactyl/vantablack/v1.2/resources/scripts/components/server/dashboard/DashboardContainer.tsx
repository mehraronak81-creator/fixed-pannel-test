import React from 'react';
import { Link } from 'react-router-dom';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import SideGraphs from '@/components/server/console/SideGraphs';
import Can from '@/components/elements/Can';
import { ArchiveIcon, CalendarIcon, EyeIcon, FolderOpenIcon, TerminalIcon, ViewGridIcon } from '@heroicons/react/outline';
import Sftp from '@/components/server/dashboard/SFTP';
import Banner from '@/components/server/dashboard/Banner';
import InfoCardAdvanced from '@/components/server/dashboard/InfoCardAdvanced';
import InfoCard from '@/components/server/dashboard/InfoCard';
import { useTranslation } from 'react-i18next';
import Console from '@/components/server/console/Console';
import { LuArrowUpRight } from 'react-icons/lu';

interface QuickActionProps {
    to: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const QuickAction = ({ to, label, description, icon: Icon }: QuickActionProps) => (
    <Link to={to} className={'group flex items-center gap-3 rounded-component border border-gray-500 bg-gray-800 px-4 py-3 duration-200 hover:border-vantablack hover:bg-gray-600'}>
        <div css={'background-color:color-mix(in srgb, var(--primary) 16%, transparent);'} className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-component text-vantablack'}>
            <Icon className={'w-5'} />
        </div>
        <div className={'min-w-0'}>
            <p className={'truncate text-sm font-semibold text-gray-100'}>{label}</p>
            <p className={'truncate text-xs text-gray-300'}>{description}</p>
        </div>
        <LuArrowUpRight className={'ml-auto w-4 shrink-0 text-gray-400 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vantablack'} />
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
    const slot1 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot1);
    const slot2 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot2);
    const slot3 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot3);
    const slot4 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot4);
    const slot5 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot5);
    const slot6 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot6);
    const slot7 = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.slot7);

    return(
        <ServerContentBlock title={t('dashboard')} icon={ViewGridIcon}>
            <section className={'mb-6 overflow-hidden rounded-box border border-gray-500 bg-gray-700 backdrop shadow-2xl'}>
                <div className={'flex flex-wrap items-center justify-between gap-3 border-b border-gray-500 px-5 py-4'}>
                    <div className={'flex items-center gap-3'}>
                        <div css={'background-color:color-mix(in srgb, var(--primary) 20%, transparent);'} className={'flex h-10 w-10 items-center justify-center rounded-component text-vantablack'}>
                            <TerminalIcon className={'w-5'} />
                        </div>
                        <div>
                            <p className={'font-semibold text-gray-50'}>Live console</p>
                            <p className={'text-xs text-gray-300'}>Monitor output and send commands without leaving your dashboard.</p>
                        </div>
                    </div>
                    <Link to={'console'} className={'group flex items-center gap-1 rounded-component border border-gray-500 px-3 py-2 text-sm text-gray-200 duration-200 hover:border-vantablack hover:text-gray-50'}>
                        Open full console
                        <LuArrowUpRight className={'w-4 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'} />
                    </Link>
                </div>
                <div className={'p-3 sm:p-4'}>
                    <Console />
                </div>
            </section>
            <section className={'mb-6 rounded-box border border-gray-500 bg-gray-700 p-4 backdrop'}>
                <div className={'mb-3 flex items-center justify-between gap-3'}>
                    <div>
                        <p className={'font-semibold text-gray-50'}>Quick actions</p>
                        <p className={'text-xs text-gray-300'}>Jump straight into the tools you use most.</p>
                    </div>
                    <TerminalIcon className={'w-5 text-vantablack'} />
                </div>
                <div className={'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
                    <Can action={'file.*'}><QuickAction to={'files'} label={'File manager'} description={'Upload and edit files'} icon={FolderOpenIcon} /></Can>
                    <Can action={'backup.*'}><QuickAction to={'backups'} label={'Backups'} description={'Protect server data'} icon={ArchiveIcon} /></Can>
                    <Can action={'schedule.*'}><QuickAction to={'schedules'} label={'Schedules'} description={'Automate commands'} icon={CalendarIcon} /></Can>
                    <Can action={'activity.*'}><QuickAction to={'activity'} label={'Activity log'} description={'Review server events'} icon={EyeIcon} /></Can>
                </div>
            </section>
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

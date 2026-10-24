import React from 'react';
import { Link } from 'react-router-dom';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import {
    FolderOpenIcon,
    ArchiveIcon,
    CalendarIcon,
    EyeIcon,
    GlobeIcon,
    UserGroupIcon,
    AdjustmentsIcon,
    CubeIcon,
    CubeTransparentIcon,
    DatabaseIcon,
    CogIcon,
    ChevronRightIcon,
    ViewGridIcon,
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

interface WorkspaceAction {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    permission: string | string[] | null;
    accentColor: string;
    accentBg: string;
}

export default () => {
    const { t } = useTranslation(['vantablack/navigation', 'vantablack/server/console']);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);

    const actions: WorkspaceAction[] = [
        {
            name: 'File Manager',
            description: 'Browse, edit, and upload files',
            icon: FolderOpenIcon,
            path: `/server/${id}/files`,
            permission: 'file.*',
            accentColor: 'text-amber-400',
            accentBg: 'bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
        },
        {
            name: 'Backups',
            description: 'Create & restore server snapshots',
            icon: ArchiveIcon,
            path: `/server/${id}/backups`,
            permission: 'backup.*',
            accentColor: 'text-emerald-400',
            accentBg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
        },
        {
            name: 'Schedules',
            description: 'Automate tasks, restarts & commands',
            icon: CalendarIcon,
            path: `/server/${id}/schedules`,
            permission: 'schedule.*',
            accentColor: 'text-blue-400',
            accentBg: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
        },
        {
            name: 'Activity Log',
            description: 'Audit logs of panel operations',
            icon: EyeIcon,
            path: `/server/${id}/activity`,
            permission: 'activity.*',
            accentColor: 'text-purple-400',
            accentBg: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
        },
        {
            name: 'Network & Ports',
            description: 'Manage allocations & connection endpoints',
            icon: GlobeIcon,
            path: `/server/${id}/network`,
            permission: 'allocation.*',
            accentColor: 'text-cyan-400',
            accentBg: 'bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
        },
        {
            name: 'Subusers',
            description: 'Delegate permissions & team access',
            icon: UserGroupIcon,
            path: `/server/${id}/users`,
            permission: 'user.*',
            accentColor: 'text-pink-400',
            accentBg: 'bg-pink-500/10 border-pink-500/20 group-hover:border-pink-500/40',
        },
        {
            name: 'Startup Parameters',
            description: 'Configure Docker variables & flags',
            icon: AdjustmentsIcon,
            path: `/server/${id}/startup`,
            permission: 'startup.*',
            accentColor: 'text-rose-400',
            accentBg: 'bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40',
        },
        {
            name: 'Mod & Plugin Installer',
            description: 'Search & install Modrinth plugins & mods',
            icon: CubeIcon,
            path: `/server/${id}/mods`,
            permission: 'file.create',
            accentColor: 'text-indigo-400',
            accentBg: 'bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40',
        },
        {
            name: 'Minecraft Manager',
            description: 'Server version selector & server properties',
            icon: CubeTransparentIcon,
            path: `/server/${id}/minecraft`,
            permission: 'file.*',
            accentColor: 'text-teal-400',
            accentBg: 'bg-teal-500/10 border-teal-500/20 group-hover:border-teal-500/40',
        },
        {
            name: 'Databases',
            description: 'Create & manage MySQL databases',
            icon: DatabaseIcon,
            path: `/server/${id}/databases`,
            permission: 'database.*',
            accentColor: 'text-yellow-400',
            accentBg: 'bg-yellow-500/10 border-yellow-500/20 group-hover:border-yellow-500/40',
        },
        {
            name: 'Server Settings',
            description: 'SFTP credentials & server settings',
            icon: CogIcon,
            path: `/server/${id}/settings`,
            permission: ['settings.*', 'file.sftp'],
            accentColor: 'text-slate-300',
            accentBg: 'bg-slate-500/10 border-slate-500/20 group-hover:border-slate-500/40',
        },
    ];

    return (
        <section className={'mt-6 mb-4'} aria-label={'Server Command Center'}>
            <div className={'flex items-center justify-between mb-3 px-1'}>
                <div className={'flex items-center gap-2'}>
                    <ViewGridIcon className={'w-5 h-5 text-indigo-400'} />
                    <h2 className={'text-base font-semibold text-white tracking-wide'}>
                        Workspace Command Center
                    </h2>
                </div>
                <span className={'text-xs text-neutral-400 font-medium'}>
                    Quick access workspace modules
                </span>
            </div>

            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}>
                {actions.map((action) => {
                    const Icon = action.icon;
                    const card = (
                        <Link
                            key={action.name}
                            to={action.path}
                            className={
                                'liquid-glass rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg group no-underline'
                            }
                        >
                            <div className={'flex items-center gap-3 min-w-0'}>
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 ${action.accentBg} ${action.accentColor}`}
                                >
                                    <Icon className={'w-5 h-5'} />
                                </div>
                                <div className={'min-w-0'}>
                                    <p className={'text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors'}>
                                        {action.name}
                                    </p>
                                    <p className={'text-xs text-neutral-400 truncate mt-0.5'}>
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                            <ChevronRightIcon
                                className={'w-4 h-4 text-neutral-500 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all shrink-0'}
                            />
                        </Link>
                    );

                    return action.permission ? (
                        <Can key={action.name} action={action.permission} matchAny>
                            {card}
                        </Can>
                    ) : (
                        card
                    );
                })}
            </div>
        </section>
    );
};

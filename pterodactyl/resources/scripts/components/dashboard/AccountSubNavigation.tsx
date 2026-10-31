import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserCircleIcon, KeyIcon, EyeIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('vantablack/account');

    return (
        <div className={'liquid-glass p-1.5 mb-6 flex items-center gap-1.5 overflow-x-auto border border-white/10 rounded-2xl shadow-xl'}>
            <NavLink
                to={'/account'}
                exact
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/5 whitespace-nowrap'}
                activeClassName={'!text-emerald-400 !bg-emerald-500/15 border border-emerald-500/30 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
            >
                <UserCircleIcon className={'w-4 h-4 text-emerald-400'} />
                <span>{t('account-overview', 'Account Overview')}</span>
            </NavLink>
            <NavLink
                to={'/account/api'}
                exact
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/5 whitespace-nowrap'}
                activeClassName={'!text-emerald-400 !bg-emerald-500/15 border border-emerald-500/30 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
            >
                <KeyIcon className={'w-4 h-4 text-emerald-400'} />
                <span>API Credentials</span>
            </NavLink>
            <NavLink
                to={'/account/activity'}
                exact
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/5 whitespace-nowrap'}
                activeClassName={'!text-emerald-400 !bg-emerald-500/15 border border-emerald-500/30 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
            >
                <EyeIcon className={'w-4 h-4 text-emerald-400'} />
                <span>{t('account-activity', 'Activity Log')}</span>
            </NavLink>
        </div>
    );
};

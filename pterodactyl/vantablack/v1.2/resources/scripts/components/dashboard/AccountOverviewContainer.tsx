import React from 'react';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import AppearanceWrapper from '@/components/dashboard/forms/AppearanceWrapper';
import PageContentBlock from '@/components/elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import UserAvatar from '@/components/UserAvatar'
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('vantablack/account');
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();

    return (
        <PageContentBlock title={t('account-overview')}>
            {state?.twoFactorRedirect && (
                <MessageBox title={'2-Factor Required'} type={'error'}>
                    {t('twofactor-messagebox')}
                </MessageBox>
            )}
            <div className={'grid lg:grid-cols-2 gap-4 mb-4'}>
                <div className={'flex flex-col gap-4'}>
                    <div className={'bg-gray-700 backdrop rounded-box overflow-hidden'}>
                        <div className={'w-full relative px-6 pt-5 z-10'}>
                            <div className={'h-3/4 w-full absolute top-0 left-0 z-[-1]'} css={'background: linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 25%, transparent) 100%);'} />
                            <div className={'w-[60px] rounded-component border-4 border-gray-700 overflow-hidden'}>
                                <UserAvatar width={'60px'} rounded={'rounded-none'}/>
                            </div>
                        </div>
                        <FlashMessageRender byKey={'account:email'} />
                        <UpdateEmailAddressForm />
                    </div>
                    <AppearanceWrapper />
                </div>
                <div className={'flex flex-col gap-4'}>
                    <FlashMessageRender byKey={'account:password'} />
                    <UpdatePasswordForm />
                    <ConfigureTwoFactorForm />
                </div>
            </div>
            <div className={'bg-gray-700 backdrop rounded-box px-6 py-5'}>
                <div className={'flex items-center justify-between gap-4 mb-5'}>
                    <div>
                        <p className={'text-gray-50 font-semibold'}>{t('sshkey')}</p>
                        <p className={'text-gray-300 text-sm mt-1'}>Manage secure shell access for your servers.</p>
                    </div>
                    <span className={'px-3 py-1 rounded-full bg-gray-600 text-gray-200 text-xs font-medium'}>Secure access</span>
                </div>
                <AccountSSHContainer />
            </div>
        </PageContentBlock>
    );
};

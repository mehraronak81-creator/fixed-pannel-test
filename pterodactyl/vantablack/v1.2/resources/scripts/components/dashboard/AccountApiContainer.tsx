import React, { useEffect, useState } from 'react';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import createApiKey from '@/api/account/createApiKey';
import deleteApiKey from '@/api/account/deleteApiKey';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import FlashMessageRender from '@/components/FlashMessageRender';
import { format } from 'date-fns';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import Code from '@/components/elements/Code';
import PageContentBlock from '@/components/elements/PageContentBlock';
import AccountSubNavigation from '@/components/dashboard/AccountSubNavigation';
import CopyOnClick from '@/components/elements/CopyOnClick';
import {
    KeyIcon,
    TrashIcon,
    DuplicateIcon,
    PlusIcon,
    ShieldCheckIcon,
    ClockIcon,
    ExclamationIcon,
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('vantablack/account');
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [description, setDescription] = useState('');
    const [allowedIps, setAllowedIps] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const { clearAndAddHttpError } = useFlashKey('account');

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => {
                clearAndAddHttpError(error);
                setLoading(false);
            });
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);
        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        clearAndAddHttpError();

        const memo = description.trim() || 'Client API Key';
        createApiKey(memo, allowedIps)
            .then(({ secretToken, ...key }) => {
                setKeys((current) => [...current, key]);
                setNewKey(`${key.identifier}${secretToken}`);
                setDescription('');
                setAllowedIps('');
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setCreating(false));
    };

    return (
        <PageContentBlock title={'Account API Credentials'}>
            <FlashMessageRender byKey={'account'} className={'mb-4'} />
            <AccountSubNavigation />

            {/* Modal for Newly Generated Secret Key */}
            {newKey && (
                <div className={'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in'}>
                    <div className={'liquid-glass p-6 sm:p-8 max-w-lg w-full border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] relative'}>
                        <div className={'flex items-center gap-3 mb-4'}>
                            <div className={'p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'}>
                                <KeyIcon className={'w-6 h-6'} />
                            </div>
                            <div>
                                <h3 className={'text-lg font-bold text-white'}>API Key Generated Successfully</h3>
                                <p className={'text-xs text-neutral-400'}>Your new credentials are ready for use.</p>
                            </div>
                        </div>

                        <div className={'p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5 mb-5'}>
                            <ExclamationIcon className={'w-4 h-4 shrink-0 mt-0.5 text-amber-400'} />
                            <span>
                                <strong>Save this key immediately!</strong> For security reasons, this secret key will never be shown again.
                            </span>
                        </div>

                        <div className={'relative mb-6'}>
                            <label className={'block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2'}>
                                API Secret Key
                            </label>
                            <div className={'flex items-center gap-2 bg-black/80 border border-white/10 rounded-xl p-3'}>
                                <code className={'font-mono text-emerald-400 text-xs sm:text-sm break-all flex-1 select-all'}>
                                    {newKey}
                                </code>
                                <CopyOnClick text={newKey}>
                                    <button
                                        type={'button'}
                                        className={'shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md'}
                                    >
                                        <DuplicateIcon className={'w-4 h-4'} />
                                        <span>Copy</span>
                                    </button>
                                </CopyOnClick>
                            </div>
                        </div>

                        <div className={'flex justify-end'}>
                            <button
                                type={'button'}
                                onClick={() => setNewKey(null)}
                                className={'px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all'}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            <Dialog.Confirm
                title={t('apiKey.delete-api-key', 'Delete API Key')}
                confirm={t('apiKey.delete-key', 'Delete Key')}
                open={!!deleteIdentifier}
                onClose={() => setDeleteIdentifier('')}
                onConfirmed={() => doDeletion(deleteIdentifier)}
            >
                {t('apiKey.all-requests-invalidated-1', 'All requests using this key will be immediately invalidated.')}&nbsp;
                <Code>{deleteIdentifier}</Code>&nbsp;
                {t('apiKey.all-requests-invalidated-2', 'Once deleted, this key cannot be recovered.')}
            </Dialog.Confirm>

            <div className={'grid lg:grid-cols-12 gap-6'}>
                {/* Create API Key Card */}
                <div className={'lg:col-span-5'}>
                    <div className={'liquid-glass p-6 rounded-2xl border border-white/10 shadow-xl relative'}>
                        <SpinnerOverlay visible={creating} />
                        <div className={'flex items-center gap-3 mb-5 pb-4 border-b border-white/5'}>
                            <div className={'p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'}>
                                <PlusIcon className={'w-5 h-5'} />
                            </div>
                            <div>
                                <h3 className={'text-base font-bold text-white'}>Create API Key</h3>
                                <p className={'text-xs text-neutral-400'}>Generate credentials for client applications.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateKey} className={'space-y-4'}>
                            <div>
                                <label className={'block text-xs font-semibold text-neutral-300 mb-1.5'}>
                                    Description / Memo <span className={'text-neutral-500 font-normal'}>(Optional)</span>
                                </label>
                                <input
                                    type={'text'}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={'e.g. Discord Bot, Backup Script, CLI'}
                                    className={'w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-neutral-600'}
                                />
                                <p className={'text-[11px] text-neutral-500 mt-1'}>
                                    A memorable note to identify what uses this token.
                                </p>
                            </div>

                            <div>
                                <label className={'block text-xs font-semibold text-neutral-300 mb-1.5'}>
                                    Allowed IP Addresses <span className={'text-neutral-500 font-normal'}>(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={allowedIps}
                                    onChange={(e) => setAllowedIps(e.target.value)}
                                    placeholder={'Leave blank to allow any IP address, or enter one IP address / CIDR per line.'}
                                    className={'w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-neutral-600 font-mono text-xs'}
                                />
                            </div>

                            <button
                                type={'submit'}
                                disabled={creating}
                                className={'w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 cursor-pointer'}
                            >
                                <KeyIcon className={'w-4 h-4'} />
                                <span>Generate API Key</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Existing API Keys List */}
                <div className={'lg:col-span-7'}>
                    <div className={'liquid-glass p-6 rounded-2xl border border-white/10 shadow-xl relative min-h-[300px]'}>
                        <SpinnerOverlay visible={loading} />
                        <div className={'flex items-center justify-between mb-5 pb-4 border-b border-white/5'}>
                            <div className={'flex items-center gap-3'}>
                                <div className={'p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'}>
                                    <ShieldCheckIcon className={'w-5 h-5'} />
                                </div>
                                <div>
                                    <h3 className={'text-base font-bold text-white'}>Active API Keys</h3>
                                    <p className={'text-xs text-neutral-400'}>Manage and revoke existing client tokens.</p>
                                </div>
                            </div>
                            <span className={'px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold'}>
                                {keys.length} {keys.length === 1 ? 'key' : 'keys'}
                            </span>
                        </div>

                        {keys.length === 0 ? (
                            <div className={'text-center py-12 px-4'}>
                                <KeyIcon className={'w-12 h-12 text-neutral-600 mx-auto mb-3 stroke-[1.5]'} />
                                <p className={'text-sm font-medium text-neutral-400'}>
                                    {loading ? 'Loading API credentials...' : 'No API keys found'}
                                </p>
                                <p className={'text-xs text-neutral-600 mt-1'}>
                                    Generate your first API key using the form on the left.
                                </p>
                            </div>
                        ) : (
                            <div className={'space-y-3'}>
                                {keys.map((key) => (
                                    <div
                                        key={key.identifier}
                                        className={'liquid-glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group'}
                                    >
                                        <div className={'flex items-start gap-3 min-w-0'}>
                                            <div className={'p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5'}>
                                                <KeyIcon className={'w-4 h-4'} />
                                            </div>
                                            <div className={'min-w-0'}>
                                                <p className={'text-sm font-semibold text-white truncate'}>
                                                    {key.description || 'Client API Key'}
                                                </p>
                                                <div className={'flex items-center gap-2 mt-1'}>
                                                    <code className={'font-mono text-xs px-2 py-0.5 rounded bg-black/60 border border-white/5 text-neutral-300'}>
                                                        {key.identifier}••••••••••••••••
                                                    </code>
                                                    <CopyOnClick text={key.identifier}>
                                                        <button
                                                            type={'button'}
                                                            title={'Copy Identifier'}
                                                            className={'p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors'}
                                                        >
                                                            <DuplicateIcon className={'w-3.5 h-3.5'} />
                                                        </button>
                                                    </CopyOnClick>
                                                </div>
                                                <div className={'flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-500'}>
                                                    <ClockIcon className={'w-3 h-3'} />
                                                    <span>
                                                        Last used:&nbsp;
                                                        {key.lastUsedAt ? format(key.lastUsedAt, 'MMM d, yyyy HH:mm') : 'Never'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={'flex items-center gap-2 shrink-0 self-end sm:self-center'}>
                                            <button
                                                type={'button'}
                                                onClick={() => setDeleteIdentifier(key.identifier)}
                                                className={'p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer'}
                                                title={'Delete API Key'}
                                            >
                                                <TrashIcon className={'w-4 h-4'} />
                                                <span className={'sm:hidden'}>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};

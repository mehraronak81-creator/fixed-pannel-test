import React, { useEffect, useState, useMemo, useCallback } from 'react';
import getFileContents from '@/api/server/files/getFileContents';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import saveFileContents from '@/api/server/files/saveFileContents';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { useHistory, useLocation, useParams } from 'react-router';
import FileNameModal from '@/components/server/files/FileNameModal';
import Can from '@/components/elements/Can';
import FlashMessageRender from '@/components/FlashMessageRender';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import modes from '@/modes';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { encodePathSegments, hashToPath } from '@/helpers';
import { dirname } from 'pathe';
import {
    FolderOpenIcon,
    DocumentTextIcon,
    CodeIcon,
    SaveIcon,
    XIcon,
    CheckIcon,
    SearchIcon,
    CogIcon,
    ChevronRightIcon,
} from '@heroicons/react/outline';
import { VscSourceControl, VscFiles, VscSettingsGear, VscCheck, VscWarning, VscError } from 'react-icons/vsc';
import { SiJavascript, SiTypescript, SiJson, SiYaml, SiMarkdown, SiPhp, SiPython, SiHtml5, SiCss3 } from 'react-icons/si';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';
import { useTranslation } from 'react-i18next';

function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
        case 'json':
            return <SiJson className={'text-yellow-400 w-4 h-4 shrink-0'} />;
        case 'yml':
        case 'yaml':
            return <SiYaml className={'text-red-400 w-4 h-4 shrink-0'} />;
        case 'js':
        case 'mjs':
            return <SiJavascript className={'text-yellow-300 w-4 h-4 shrink-0'} />;
        case 'ts':
            return <SiTypescript className={'text-blue-400 w-4 h-4 shrink-0'} />;
        case 'php':
            return <SiPhp className={'text-indigo-400 w-4 h-4 shrink-0'} />;
        case 'py':
            return <SiPython className={'text-blue-300 w-4 h-4 shrink-0'} />;
        case 'html':
            return <SiHtml5 className={'text-orange-500 w-4 h-4 shrink-0'} />;
        case 'css':
            return <SiCss3 className={'text-blue-500 w-4 h-4 shrink-0'} />;
        case 'md':
            return <SiMarkdown className={'text-blue-200 w-4 h-4 shrink-0'} />;
        case 'log':
        case 'txt':
        case 'properties':
        case 'cfg':
        case 'conf':
        case 'ini':
            return <DocumentTextIcon className={'text-emerald-400 w-4 h-4 shrink-0'} />;
        default:
            return <CodeIcon className={'text-indigo-300 w-4 h-4 shrink-0'} />;
    }
}

export default () => {
    const { t } = useTranslation('vantablack/server/files');
    const [error, setError] = useState('');
    const { action } = useParams<{ action: 'new' | string }>();
    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('text/plain');
    const [isSavedRecently, setIsSavedRecently] = useState(false);

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, clearFlashes } = useFlash();

    let fetchFileContent: null | (() => Promise<string>) = null;

    const rawPath = hash.replace(/^#\/?/, '');
    const filename = rawPath ? rawPath.split('/').pop() || 'untitled' : 'untitled';
    const pathSegments = rawPath ? rawPath.split('/').filter(Boolean) : ['untitled'];

    useEffect(() => {
        if (action === 'new') return;

        setError('');
        setLoading(true);
        const path = hashToPath(hash);
        setDirectory(dirname(path));
        getFileContents(uuid, path)
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [action, uuid, hash]);

    const save = useCallback(
        (name?: string) => {
            if (!fetchFileContent) {
                return;
            }

            setLoading(true);
            clearFlashes('files:view');
            fetchFileContent()
                .then((content) => saveFileContents(uuid, name || hashToPath(hash), content))
                .then(() => {
                    setIsSavedRecently(true);
                    setTimeout(() => setIsSavedRecently(false), 2500);

                    if (name) {
                        history.push(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
                        return;
                    }

                    return Promise.resolve();
                })
                .catch((error) => {
                    console.error(error);
                    addError({ message: httpErrorToHuman(error), key: 'files:view' });
                })
                .then(() => setLoading(false));
        },
        [fetchFileContent, hash, id, uuid]
    );

    // Global VS Code shortcut Ctrl+S / Cmd+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (action !== 'edit') {
                    setModalVisible(true);
                } else {
                    save();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [action, save]);

    if (error) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    return (
        <ServerContentBlock title={t('file-manager')} icon={FolderOpenIcon}>
            <FlashMessageRender byKey={'files:view'} css={tw`mb-4`} />
            
            <ErrorBoundary>
                <div css={tw`mb-3`}>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </div>
            </ErrorBoundary>

            {hash.replace(/^#/, '').endsWith('.pteroignore') && (
                <div
                    className={'mb-4 p-4 border-l-4 rounded-lg text-yellow-200 text-sm'}
                    style={{ backgroundColor: 'rgba(120, 53, 15, 0.4)', borderColor: '#f59e0b' }}
                >
                    <p>
                        {t('edit.youre-editing')}{' '}
                        <code
                            className={'font-mono rounded px-1.5 py-0.5 text-yellow-300'}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            .pteroignore
                        </code>{' '}
                        {t('edit.will-be-exluded')} (
                        <code
                            className={'font-mono rounded px-1.5 py-0.5 text-yellow-300'}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            *
                        </code>
                        ).
                        {t('edit.you-can-negate')} (
                        <code
                            className={'font-mono rounded px-1.5 py-0.5 text-yellow-300'}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                        >
                            !
                        </code>
                        ).
                    </p>
                </div>
            )}

            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />

            {/* VS Code Window Container */}
            <div className={'liquid-glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col min-h-[580px]'}>
                <div className={'flex flex-1'}>
                    {/* VS Code Left Activity Bar */}
                    <div className={'w-12 bg-[#121624]/90 border-r border-white/5 flex flex-col items-center py-3 shrink-0 gap-5 select-none hidden sm:flex'}>
                        <button
                            type={'button'}
                            title={'Explorer'}
                            className={'w-8 h-8 rounded-lg flex items-center justify-center text-white bg-white/10 border-l-2 border-indigo-400'}
                        >
                            <VscFiles className={'w-5 h-5'} />
                        </button>
                        <button
                            type={'button'}
                            title={'Search'}
                            className={'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors'}
                        >
                            <SearchIcon className={'w-5 h-5'} />
                        </button>
                        <button
                            type={'button'}
                            title={'Source Control'}
                            className={'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors'}
                        >
                            <VscSourceControl className={'w-5 h-5'} />
                        </button>
                        <div className={'mt-auto'}>
                            <button
                                type={'button'}
                                title={'Settings'}
                                className={'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors'}
                            >
                                <VscSettingsGear className={'w-5 h-5'} />
                            </button>
                        </div>
                    </div>

                    {/* VS Code Left File Tree Explorer */}
                    <div className={'w-52 bg-[#0e121e] border-r border-white/5 flex flex-col shrink-0 select-none hidden md:flex'}>
                        <div className={'px-3.5 py-2.5 flex items-center justify-between border-b border-white/5 text-[11px] font-bold text-gray-400 tracking-wider'}>
                            <span className={'flex items-center gap-1.5'}>
                                <FolderOpenIcon className={'w-3.5 h-3.5 text-indigo-400'} />
                                EXPLORER
                            </span>
                            <span className={'text-[10px] text-gray-500 font-mono'}>WORKSPACE</span>
                        </div>
                        <div className={'p-2 flex flex-col gap-0.5 overflow-y-auto text-xs text-gray-300 font-mono'}>
                            <div className={'flex items-center gap-1.5 px-2 py-1 text-gray-400 font-semibold text-[11px]'}>
                                <FolderOpenIcon className={'w-3.5 h-3.5 text-indigo-400'} />
                                <span className={'truncate'}>/home/container</span>
                            </div>
                            <div className={'pl-2 flex flex-col gap-0.5 mt-0.5'}>
                                <div className={'flex items-center gap-1.5 px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer text-xs'}>
                                    <FolderOpenIcon className={'w-3.5 h-3.5 text-amber-400 shrink-0'} />
                                    <span>logs/</span>
                                </div>
                                <div className={'flex items-center gap-1.5 px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer text-xs'}>
                                    <FolderOpenIcon className={'w-3.5 h-3.5 text-amber-400 shrink-0'} />
                                    <span>config/</span>
                                </div>
                                <div className={'flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/20 text-white border-l-2 border-indigo-400 font-medium text-xs'}>
                                    <span className={'text-indigo-400 font-bold select-none text-[10px]'}>&lt;&thinsp;&gt;</span>
                                    {getFileIcon(filename)}
                                    <span className={'truncate'}>{filename}</span>
                                </div>
                                <div className={'flex items-center gap-1.5 px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer text-xs'}>
                                    <CodeIcon className={'w-3.5 h-3.5 text-emerald-400 shrink-0'} />
                                    <span>server.properties</span>
                                </div>
                                <div className={'flex items-center gap-1.5 px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer text-xs'}>
                                    <CodeIcon className={'w-3.5 h-3.5 text-blue-400 shrink-0'} />
                                    <span>ecosystem.config.cjs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Editor Work Area */}
                    <div className={'flex-1 flex flex-col min-w-0 bg-[#0d111c]/95'}>
                        {/* VS Code Tab Bar */}
                        <div className={'bg-[#0f1422] border-b border-white/5 flex items-center justify-between overflow-x-auto select-none px-2 h-10'}>
                            {/* Active Tab with < > filename */}
                            <div className={'flex items-center'}>
                                <div className={'flex items-center gap-2 bg-[#182035] border-t-2 border-indigo-500 border-r border-white/5 px-4 h-10 text-sm font-medium text-white shadow-inner cursor-pointer'}>
                                    <span className={'text-indigo-400 font-mono font-bold text-xs select-none'}>&lt;&thinsp;&gt;</span>
                                    {getFileIcon(filename)}
                                    <span className={'truncate max-w-[200px]'}>{filename}</span>
                                    <button
                                        type={'button'}
                                        onClick={() => history.goBack()}
                                        title={'Close'}
                                        className={'ml-2 p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white'}
                                    >
                                        <XIcon className={'w-3.5 h-3.5'} />
                                    </button>
                                </div>
                            </div>

                            {/* Top Right Editor Actions */}
                            <div className={'flex items-center gap-2 pr-2'}>
                                {action === 'edit' ? (
                                    <Can action={'file.update'}>
                                        <button
                                            type={'button'}
                                            onClick={() => save()}
                                            disabled={loading}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                                                isSavedRecently
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/25'
                                            }`}
                                        >
                                            {isSavedRecently ? (
                                                <>
                                                    <CheckIcon className={'w-3.5 h-3.5'} /> Saved
                                                </>
                                            ) : (
                                                <>
                                                    <SaveIcon className={'w-3.5 h-3.5'} /> {t('edit.save-content')}
                                                </>
                                            )}
                                        </button>
                                    </Can>
                                ) : (
                                    <Can action={'file.create'}>
                                        <button
                                            type={'button'}
                                            onClick={() => setModalVisible(true)}
                                            disabled={loading}
                                            className={'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'}
                                        >
                                            <SaveIcon className={'w-3.5 h-3.5'} /> {t('edit.create-file')}
                                        </button>
                                    </Can>
                                )}
                            </div>
                        </div>

                        {/* VS Code Breadcrumb Bar */}
                        <div className={'bg-[#0c0f1a] px-4 py-1.5 border-b border-white/5 flex items-center gap-1.5 text-xs text-neutral-400 font-mono select-none overflow-x-auto'}>
                            <FolderOpenIcon className={'w-3.5 h-3.5 text-indigo-400 shrink-0'} />
                            <span>server</span>
                            {pathSegments.map((segment, idx) => (
                                <React.Fragment key={idx}>
                                    <ChevronRightIcon className={'w-3 h-3 text-neutral-600 shrink-0'} />
                                    <span className={idx === pathSegments.length - 1 ? 'text-neutral-200 font-semibold' : ''}>
                                        {segment}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Editor Canvas */}
                        <div className={'relative flex-1 bg-[#0b0e18] min-h-[460px]'}>
                            <SpinnerOverlay visible={loading} />
                            <CodemirrorEditor
                                mode={mode}
                                filename={hash.replace(/^#/, '')}
                                onModeChanged={setMode}
                                initialContent={content}
                                fetchContent={(value) => {
                                    fetchFileContent = value;
                                }}
                                onContentSaved={() => {
                                    if (action !== 'edit') {
                                        setModalVisible(true);
                                    } else {
                                        save();
                                    }
                                }}
                            />
                        </div>

                        {/* VS Code Status Bar */}
                        <div className={'bg-[#0b1020] border-t border-white/5 px-3 py-1 flex items-center justify-between text-xs text-neutral-400 select-none'}>
                            {/* Left Side Status */}
                            <div className={'flex items-center gap-4'}>
                                <div className={'flex items-center gap-1.5 text-indigo-400 font-medium'}>
                                    <VscSourceControl className={'w-3.5 h-3.5'} />
                                    <span>Main branch</span>
                                </div>
                                <div className={'flex items-center gap-2'}>
                                    <span className={'flex items-center gap-0.5 hover:text-white cursor-pointer'}>
                                        <VscError className={'w-3 h-3 text-red-400'} /> 0
                                    </span>
                                    <span className={'flex items-center gap-0.5 hover:text-white cursor-pointer'}>
                                        <VscWarning className={'w-3 h-3 text-amber-400'} /> 0
                                    </span>
                                </div>
                                <div className={'hidden md:inline-flex items-center gap-1 text-neutral-500'}>
                                    {isSavedRecently ? (
                                        <span className={'text-emerald-400 flex items-center gap-1'}>
                                            <VscCheck className={'w-3.5 h-3.5'} /> Synchronized
                                        </span>
                                    ) : (
                                        <span>Ctrl + S to save</span>
                                    )}
                                </div>
                            </div>

                            {/* Right Side Status */}
                            <div className={'flex items-center gap-4'}>
                                <span className={'hidden sm:inline font-mono'}>Spaces: 4</span>
                                <span className={'hidden sm:inline font-mono'}>UTF-8</span>
                                <span className={'hidden sm:inline font-mono'}>LF</span>

                                {/* Language Syntax Mode Selector */}
                                <div className={'relative flex items-center'}>
                                    <select
                                        value={mode}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.currentTarget.value)}
                                        className={'bg-transparent hover:bg-white/10 text-neutral-200 text-xs py-0.5 px-2 rounded cursor-pointer border-none outline-none font-mono'}
                                    >
                                        {modes.map((m) => (
                                            <option key={`${m.name}_${m.mime}`} value={m.mime} className={'bg-[#0f1422] text-white'}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import CodeMirror from 'codemirror';
import {
    FolderOpenIcon,
    DocumentTextIcon,
    CodeIcon,
    SaveIcon,
    XIcon,
    CheckIcon,
    SearchIcon,
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
        case 'cjs':
            return <SiJavascript className={'text-yellow-300 w-4 h-4 shrink-0'} />;
        case 'ts':
            return <SiTypescript className={'text-blue-400 w-4 h-4 shrink-0'} />;
        case 'php':
            return <SiPhp className={'text-sky-400 w-4 h-4 shrink-0'} />;
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
            return <CodeIcon className={'text-neutral-400 w-4 h-4 shrink-0'} />;
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
    const [showExplorer, setShowExplorer] = useState(true);

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, clearFlashes } = useFlash();

    const { data: fileData } = useFileManagerSwr();

    const editorRef = useRef<CodeMirror.Editor | null>(null);
    const fetchFileContent = useRef<null | (() => Promise<string>)>(null);

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
            setLoading(true);
            clearFlashes('files:view');

            const getContentPromise = (): Promise<string> => {
                if (fetchFileContent.current) {
                    return fetchFileContent.current().catch(() => {
                        if (editorRef.current) {
                            return editorRef.current.getValue();
                        }
                        return content;
                    });
                }
                if (editorRef.current) {
                    return Promise.resolve(editorRef.current.getValue());
                }
                return Promise.resolve(content);
            };

            getContentPromise()
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
        [hash, id, uuid, content]
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

    const handleTriggerSearch = () => {
        if (editorRef.current) {
            editorRef.current.focus();
            try {
                // @ts-expect-error CodeMirror commands
                CodeMirror.commands.find(editorRef.current);
            } catch (err) {
                console.error('Failed to trigger find:', err);
            }
        }
    };

    const handleCloseTab = () => {
        const currentPath = hashToPath(hash);
        const parentDir = dirname(currentPath);
        const cleanDir = parentDir === '.' ? '' : parentDir;
        history.push(`/server/${id}/files#/${encodePathSegments(cleanDir)}`);
    };

    const handleOpenFile = (targetFile: string) => {
        const fullPath = directory ? `${directory}/${targetFile}` : targetFile;
        history.push(`/server/${id}/files/edit#/${encodePathSegments(fullPath)}`);
    };

    const handleOpenFolder = (folderName: string) => {
        const fullDir = directory ? `${directory}/${folderName}` : folderName;
        setDirectory(fullDir);
    };

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

            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />

            {/* VS Code Dark Window Container */}
            <div className={'liquid-glass rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col min-h-[580px]'}>
                <div className={'flex flex-1 min-h-[520px]'}>
                    {/* VS Code Left Activity Bar */}
                    <div className={'w-12 bg-[#0a0a0c] border-r border-white/5 flex flex-col items-center py-3 shrink-0 gap-4 select-none hidden sm:flex'}>
                        <button
                            type={'button'}
                            title={'Explorer (Toggle)'}
                            onClick={() => setShowExplorer((prev) => !prev)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                showExplorer
                                    ? 'text-white bg-white/10 border-l-2 border-emerald-400'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <VscFiles className={'w-5 h-5'} />
                        </button>
                        <button
                            type={'button'}
                            title={'Search Code (Ctrl+F)'}
                            onClick={handleTriggerSearch}
                            className={'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors'}
                        >
                            <SearchIcon className={'w-5 h-5'} />
                        </button>
                        <button
                            type={'button'}
                            title={'Source Control'}
                            className={'w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors'}
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
                    {showExplorer && (
                        <div className={'w-56 bg-[#09090b] border-r border-white/5 flex flex-col shrink-0 select-none hidden md:flex'}>
                            <div className={'px-3.5 py-2.5 flex items-center justify-between border-b border-white/5 text-[11px] font-bold text-neutral-400 tracking-wider'}>
                                <span className={'flex items-center gap-1.5'}>
                                    <FolderOpenIcon className={'w-3.5 h-3.5 text-emerald-400'} />
                                    EXPLORER
                                </span>
                                <span className={'text-[10px] text-neutral-500 font-mono'}>WORKSPACE</span>
                            </div>

                            <div className={'p-2 flex flex-col gap-0.5 overflow-y-auto text-xs text-neutral-300 font-mono max-h-[500px]'}>
                                <div className={'flex items-center gap-1.5 px-2 py-1 text-neutral-400 font-semibold text-[11px]'}>
                                    <FolderOpenIcon className={'w-3.5 h-3.5 text-emerald-400 shrink-0'} />
                                    <span className={'truncate'}>/{directory || 'container'}</span>
                                </div>

                                <div className={'pl-2 flex flex-col gap-0.5 mt-0.5'}>
                                    {/* Render dynamic directory files */}
                                    {fileData && fileData.files && fileData.files.length > 0 ? (
                                        fileData.files.map((item) => {
                                            const isCurrentFile = item.name === filename;
                                            if (item.isFile) {
                                                return (
                                                    <div
                                                        key={item.name}
                                                        onClick={() => handleOpenFile(item.name)}
                                                        className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
                                                            isCurrentFile
                                                                ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400 font-medium'
                                                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <span className={'text-emerald-400 font-bold select-none text-[10px]'}>&lt;&thinsp;&gt;</span>
                                                        {getFileIcon(item.name)}
                                                        <span className={'truncate'}>{item.name}</span>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div
                                                        key={item.name}
                                                        onClick={() => handleOpenFolder(item.name)}
                                                        className={'flex items-center gap-1.5 px-2 py-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-white/5 cursor-pointer text-xs transition-colors'}
                                                    >
                                                        <FolderOpenIcon className={'w-3.5 h-3.5 text-amber-400 shrink-0'} />
                                                        <span className={'truncate'}>{item.name}/</span>
                                                    </div>
                                                );
                                            }
                                        })
                                    ) : (
                                        <>
                                            <div
                                                onClick={() => handleOpenFile(filename)}
                                                className={'flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400 font-medium text-xs'}
                                            >
                                                <span className={'text-emerald-400 font-bold select-none text-[10px]'}>&lt;&thinsp;&gt;</span>
                                                {getFileIcon(filename)}
                                                <span className={'truncate'}>{filename}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Editor Work Area */}
                    <div className={'flex-1 flex flex-col min-w-0 bg-[#070709]'}>
                        {/* VS Code Tab Bar */}
                        <div className={'bg-[#0a0a0d] border-b border-white/5 flex items-center justify-between overflow-x-auto select-none px-2 h-10'}>
                            {/* Active Tab with < > filename */}
                            <div className={'flex items-center'}>
                                <div className={'flex items-center gap-2 bg-[#121217] border-t-2 border-emerald-500 border-r border-white/5 px-4 h-10 text-xs font-mono font-medium text-white shadow-inner cursor-pointer'}>
                                    <span className={'text-emerald-400 font-mono font-bold text-xs select-none'}>&lt;&thinsp;&gt;</span>
                                    {getFileIcon(filename)}
                                    <span className={'truncate max-w-[200px]'}>{filename}</span>
                                    <button
                                        type={'button'}
                                        onClick={handleCloseTab}
                                        title={'Close Tab (Return to File Manager)'}
                                        className={'ml-2 p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors'}
                                    >
                                        <XIcon className={'w-3.5 h-3.5'} />
                                    </button>
                                </div>
                            </div>

                            {/* Top Right Editor Actions: Save File Button */}
                            <div className={'flex items-center gap-2 pr-2'}>
                                {action === 'edit' ? (
                                    <Can action={'file.update'}>
                                        <button
                                            type={'button'}
                                            onClick={() => save()}
                                            disabled={loading}
                                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                                                isSavedRecently
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                                            }`}
                                        >
                                            {isSavedRecently ? (
                                                <>
                                                    <CheckIcon className={'w-3.5 h-3.5'} /> Saved
                                                </>
                                            ) : loading ? (
                                                <>
                                                    <span className={'w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin'} />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <SaveIcon className={'w-3.5 h-3.5'} /> Save File
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
                                            className={'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'}
                                        >
                                            <SaveIcon className={'w-3.5 h-3.5'} /> Save File
                                        </button>
                                    </Can>
                                )}
                            </div>
                        </div>

                        {/* VS Code Breadcrumb Bar */}
                        <div className={'bg-[#08080a] px-4 py-1.5 border-b border-white/5 flex items-center gap-1.5 text-xs text-neutral-400 font-mono select-none overflow-x-auto'}>
                            <FolderOpenIcon className={'w-3.5 h-3.5 text-emerald-400 shrink-0'} />
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
                        <div className={'relative flex-1 bg-[#060608] min-h-[460px]'}>
                            <SpinnerOverlay visible={loading} />
                            <CodemirrorEditor
                                mode={mode}
                                filename={hash.replace(/^#/, '')}
                                onModeChanged={setMode}
                                initialContent={content}
                                onEditor={(editorInstance) => {
                                    editorRef.current = editorInstance;
                                }}
                                fetchContent={(value) => {
                                    fetchFileContent.current = value;
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
                        <div className={'bg-[#08080a] border-t border-white/5 px-3 py-1 flex items-center justify-between text-xs text-neutral-400 select-none'}>
                            {/* Left Side Status */}
                            <div className={'flex items-center gap-4'}>
                                <div className={'flex items-center gap-1.5 text-emerald-400 font-medium'}>
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
                                            <option key={`${m.name}_${m.mime}`} value={m.mime} className={'bg-[#0a0a0d] text-white'}>
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
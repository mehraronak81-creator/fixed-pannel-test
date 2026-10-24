import axios, { AxiosProgressEvent } from 'axios';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import React, { useEffect, useRef } from 'react';
import { ModalMask } from '@/components/elements/Modal';
import Fade from '@/components/elements/Fade';
import useEventListener from '@/plugins/useEventListener';
import { useFlashKey } from '@/plugins/useFlash';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { ServerContext } from '@/state/server';
import { WithClassname } from '@/components/types';
import Portal from '@/components/elements/Portal';
import { CloudUploadIcon } from '@heroicons/react/outline';
import { useSignal } from '@preact/signals-react';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { LuUpload } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

function isFileOrDirectory(event: DragEvent): boolean {
    if (!event.dataTransfer?.types) {
        return false;
    }

    const types = Array.from(event.dataTransfer.types);
    return types.some((value) => value.toLowerCase() === 'files' || value === 'application/x-moz-file');
}

export default ({ className }: WithClassname) => {
    const { t } = useTranslation('vantablack/server/files');
    const fileUploadInput = useRef<HTMLInputElement>(null);

    const visible = useSignal(false);
    const timeouts = useSignal<NodeJS.Timeout[]>([]);

    const { mutate } = useFileManagerSwr();
    const { addError, clearAndAddHttpError } = useFlashKey('files');

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { clearFileUploads, removeFileUpload, pushFileUpload, setUploadProgress } = ServerContext.useStoreActions(
        (actions) => actions.files
    );

    // Track how many nested dragenter/dragleave pairs are active so the overlay
    // does not flicker when the cursor moves across child elements.
    const dragCounter = useSignal(0);

    useEventListener(
        'dragenter',
        (e) => {
            if (!isFileOrDirectory(e)) return;
            e.preventDefault();
            e.stopPropagation();
            dragCounter.value += 1;
            visible.value = true;
        },
        { capture: true }
    );

    // `dragover` must be prevented on the window otherwise the browser blocks the
    // subsequent `drop` event entirely (this is the root cause of drag & drop
    // "not working" in modern Chromium/Firefox builds).
    useEventListener(
        'dragover',
        (e) => {
            if (!isFileOrDirectory(e)) return;
            e.preventDefault();
            e.stopPropagation();
            visible.value = true;
        },
        { capture: true }
    );

    useEventListener(
        'dragleave',
        (e) => {
            if (!isFileOrDirectory(e)) return;
            e.preventDefault();
            e.stopPropagation();
            dragCounter.value = Math.max(0, dragCounter.value - 1);
            if (dragCounter.value === 0) {
                visible.value = false;
            }
        },
        { capture: true }
    );

    // A drop anywhere in the window should reset the counter regardless of where
    // it landed so a subsequent drag works correctly.
    useEventListener(
        'drop',
        (e) => {
            dragCounter.value = 0;
            if (!isFileOrDirectory(e)) return;
            e.preventDefault();
        },
        { capture: true }
    );

    // `dragexit` is deprecated and no longer fires in modern browsers; keep it as
    // a defensive fallback for very old engines only.
    useEventListener('dragexit', () => {
        dragCounter.value = 0;
        visible.value = false;
    });

    useEventListener('keydown', () => {
        dragCounter.value = 0;
        visible.value = false;
    });

    useEffect(() => {
        return () => timeouts.value.forEach(clearTimeout);
    }, []);

    const onUploadProgress = (data: AxiosProgressEvent, name: string) => {
        setUploadProgress({ name, loaded: data.loaded });
    };

    const onFileSubmission = (files: FileList) => {
        clearAndAddHttpError();
        const list = Array.from(files);
        if (list.some((file) => !file.size || (!file.type && file.size === 4096))) {
            return addError('Folder uploads are not supported at this time.', 'Error');
        }

        const uploads = list.map((file) => {
            const controller = new AbortController();
            pushFileUpload({
                name: file.name,
                data: { abort: controller, loaded: 0, total: file.size },
            });

            return () =>
                getFileUploadUrl(uuid).then((url) =>
                    axios
                        .post(
                            url,
                            { files: file },
                            {
                                signal: controller.signal,
                                headers: { 'Content-Type': 'multipart/form-data' },
                                params: { directory },
                                onUploadProgress: (data) => onUploadProgress(data, file.name),
                            }
                        )
                        .then(() => timeouts.value.push(setTimeout(() => removeFileUpload(file.name), 500)))
                );
        });

        Promise.all(uploads.map((fn) => fn()))
            .then(() => mutate())
            .catch((error) => {
                clearFileUploads();
                clearAndAddHttpError(error);
            });
    };

    return (
        <>
            <Portal>
                <Fade appear in={visible.value} timeout={75} key={'upload_modal_mask'} unmountOnExit>
                    <ModalMask
                        onClick={() => (visible.value = false)}
                        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            if (e.dataTransfer) {
                                e.dataTransfer.dropEffect = 'copy';
                            }
                        }}
                        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            e.stopPropagation();

                            visible.value = false;
                            dragCounter.value = 0;
                            if (!e.dataTransfer?.files.length) return;

                            onFileSubmission(e.dataTransfer.files);
                        }}
                    >
                        <div className={'w-full flex items-center justify-center pointer-events-none p-6'}>
                            <div
                                className={
                                    'flex flex-col items-center justify-center gap-3 liquid-glass rounded-2xl p-8 max-w-md w-full border-2 border-dashed border-indigo-400/50 shadow-[0_0_50px_rgba(99,102,241,0.25)]'
                                }
                            >
                                <div className={'w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-bounce shadow-inner'}>
                                    <CloudUploadIcon className={'w-10 h-10'} />
                                </div>
                                <h3 className={'font-header text-xl font-semibold text-white text-center'}>
                                    {t('drag-and-drop')}
                                </h3>
                                <p className={'text-xs text-indigo-200/70 font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5'}>
                                    /{directory || ''}
                                </p>
                            </div>
                        </div>
                    </ModalMask>
                </Fade>
            </Portal>
            <input
                type={'file'}
                ref={fileUploadInput}
                css={tw`hidden`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.currentTarget.files) return;

                    onFileSubmission(e.currentTarget.files);
                    if (fileUploadInput.current) {
                        fileUploadInput.current.files = null;
                    }
                }}
                multiple
            />
            <Tooltip content={`${t('upload')}`}>
                <Button className={className} onClick={() => fileUploadInput.current && fileUploadInput.current.click()}>
                    <LuUpload />
                </Button>
            </Tooltip>
        </>
    );
};

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { StopIcon, RefreshIcon, PlayIcon, MinusCircleIcon } from '@heroicons/react/outline';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import { useTranslation } from 'react-i18next';
import styles from './power-buttons.module.css';

interface PowerButtonProps {
    icons?: boolean;
    className?: string;
}

export default ({ className, icons }: PowerButtonProps) => {
    const { t } = useTranslation('vantablack/utilities');
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const killable = status === 'stopping';

    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        event.preventDefault();
        if (action === 'kill') {
            setOpen(true);
            return;
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') setOpen(false);
    }, [status]);

    const buttonClass = (variant: 'start' | 'restart' | 'stop') =>
        classNames(styles.button, styles[variant], { [styles.iconOnly]: icons });

    return (
        <div className={classNames(styles.controls, className)} data-status={status}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={t('forcibly-stop-process')}
                confirm={t('continue')}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                {t('forcibly-stopping-alert')}
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <Button.Success
                    className={buttonClass('start')}
                    disabled={status !== 'offline' || !instance}
                    onClick={onButtonClick.bind(this, 'start')}
                    aria-label={t('start')}
                    title={t('start')}
                >
                    <PlayIcon className={'w-4 h-4'} />
                    {!icons && <span>{t('start')}</span>}
                </Button.Success>
            </Can>
            <Can action={'control.restart'}>
                <Button.Text
                    className={buttonClass('restart')}
                    disabled={!status || !instance}
                    onClick={onButtonClick.bind(this, 'restart')}
                    aria-label={t('restart')}
                    title={t('restart')}
                >
                    <RefreshIcon className={'w-4 h-4'} />
                    {!icons && <span>{t('restart')}</span>}
                </Button.Text>
            </Can>
            <Can action={'control.stop'}>
                <Button.Danger
                    className={buttonClass('stop')}
                    disabled={status === 'offline' || !instance}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                    aria-label={killable ? t('kill') : t('stop')}
                    title={killable ? t('kill') : t('stop')}
                >
                    {killable ? <MinusCircleIcon className={'w-4 h-4'} /> : <StopIcon className={'w-4 h-4'} />}
                    {!icons && <span>{killable ? t('kill') : t('stop')}</span>}
                </Button.Danger>
            </Can>
        </div>
    );
};
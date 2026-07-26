import React from 'react';
import { Trans, TransProps, useTranslation } from 'react-i18next';

type Props = Omit<TransProps<any>, 't' | 'ns'> & { ns?: string };

export default ({ ns, children, ...props }: Props) => {
    const { t } = useTranslation(ns);

    return (
        <Trans t={t} {...props}>
            {children}
        </Trans>
    );
};
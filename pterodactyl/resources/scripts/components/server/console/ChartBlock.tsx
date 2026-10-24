import React from 'react';
import { ServerContext } from '@/state/server';
import styles from '@/components/server/console/style.module.css';
import { ChipIcon, CloudIcon } from '@heroicons/react/outline';
import { LuMemoryStick } from 'react-icons/lu';

interface ChartBlockProps {
    type: string;
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
    usage?: string;
    limit?: string;
    inbound?: string;
    outbound?: string;
}

export default ({ type, title, legend, usage, limit, inbound, outbound, children }: ChartBlockProps) => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const value = inbound && outbound ? `${inbound} / ${outbound}` : usage;

    return (
        <section className={styles.chart_container}>
            <header className={styles.chart_header}>
                <div>
                    <p className={styles.chart_title}>{title}</p>
                    <div className={styles.chart_metric}>
                        <strong>{status === 'offline' ? 'Offline' : value || '—'}</strong>
                        {status !== 'offline' && limit && <span>/ {limit}</span>}
                    </div>
                </div>
                <div className={styles.chart_meta}>
                    {legend && <div className={styles.chart_legend}>{legend}</div>}
                    <div className={styles.chart_icon}>
                        {type === 'cpu' ? <ChipIcon /> : type === 'network' ? <CloudIcon /> : <LuMemoryStick />}
                    </div>
                </div>
            </header>
            <div className={styles.chart_canvas}>{children}</div>
        </section>
    );
};
import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import ChartBlock from '@/components/server/console/ChartBlock';
import { useTranslation } from 'react-i18next';

type Stats = Record<'memory' | 'cpu' | 'rx' | 'tx', number>;

export default () => {
    const { t } = useTranslation('vantablack/utilities');
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, rx: 0, tx: 0 });
    const [rate, setRate] = useState<{ rxSec: number; txSec: number }>({ rxSec: 0, txSec: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2, (opts) => ({
        ...opts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
    }));

    const memory = useChartTickLabel('Memory', limits.memory, 'MiB', undefined, (opts) => ({
        ...opts,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        fill: true,
    }));

    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            return {
                ...opts,
                label: !index ? 'Network In (RX)' : 'Network Out (TX)',
                borderColor: !index ? '#06b6d4' : '#10b981',
                backgroundColor: 'transparent',
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
            setRate({ rxSec: 0, txSec: 0 });
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        const rxDelta = previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx);
        const txDelta = previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx);

        setStats({
            memory: values.memory_bytes,
            cpu: values.cpu_absolute,
            tx: values.network.tx_bytes,
            rx: values.network.rx_bytes,
        });

        setRate({
            rxSec: rxDelta,
            txSec: txDelta,
        });

        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        network.push([rxDelta, txDelta]);

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    const memoryLimitStr = limits.memory ? bytesToString(mbToBytes(limits.memory)) : '∞';

    return (
        <>
            <ChartBlock
                title={t('cpu-usage') || 'CPU Load'}
                type={'cpu'}
                limit={limits.cpu ? limits.cpu + '%' : '∞'}
                usage={`${stats.cpu.toFixed(2)}%`}
            >
                <Line {...cpu.props} />
            </ChartBlock>

            <ChartBlock
                title={t('memory-usage') || 'Memory Usage'}
                type={'memory'}
                limit={memoryLimitStr}
                usage={bytesToString(stats.memory)}
            >
                <Line {...memory.props} />
            </ChartBlock>

            <ChartBlock
                type={'network'}
                title={t('inbound-outbound') || 'Network Traffic'}
                inbound={`${bytesToString(stats.rx)} (${bytesToString(rate.rxSec)}/s)`}
                outbound={`${bytesToString(stats.tx)} (${bytesToString(rate.txSec)}/s)`}
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};

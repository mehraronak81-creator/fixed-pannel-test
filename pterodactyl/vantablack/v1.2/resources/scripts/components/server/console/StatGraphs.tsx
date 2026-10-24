import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import ChartBlock from '@/components/server/console/ChartBlock';
import { useTranslation } from 'react-i18next';

type Stats = Record<'memory' | 'cpu' | 'rx' | 'tx', number>;

function generateSmoothPath(points: number[], max: number, width = 300, height = 80) {
    const padTop = 6;
    const padBottom = 6;
    const plotHeight = height - padTop - padBottom;
    const safeMax = Math.max(max, ...points, 1);

    const coords = points.map((p, i) => {
        const x = (i / Math.max(1, points.length - 1)) * width;
        const norm = Math.min(1, Math.max(0, p / safeMax));
        const y = height - padBottom - norm * plotHeight;
        return [x, y] as [number, number];
    });

    if (coords.length === 0) return { line: '', area: '' };

    let line = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const [x0, y0] = coords[i];
        const [x1, y1] = coords[i + 1];
        const cx = (x0 + x1) / 2;
        line += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }

    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { line, area };
}

interface SparklineProps {
    id: string;
    data: number[];
    maxVal: number;
    strokeColor: string;
    secondaryData?: number[];
    secondaryColor?: string;
}

const Sparkline = ({ id, data, maxVal, strokeColor, secondaryData, secondaryColor }: SparklineProps) => {
    const primaryPath = generateSmoothPath(data, maxVal);
    const secondaryPath = secondaryData && secondaryColor ? generateSmoothPath(secondaryData, maxVal) : null;

    return (
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-full overflow-hidden block">
            <defs>
                <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.30" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
                {secondaryColor && (
                    <linearGradient id={`grad-sec-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
                    </linearGradient>
                )}
            </defs>

            {/* Subtle horizontal dashed grid lines */}
            <line x1="0" y1="18" x2="300" y2="18" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="46" x2="300" y2="46" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="74" x2="300" y2="74" stroke="rgba(255,255,255,0.08)" />

            {/* Primary Area Fill */}
            <path d={primaryPath.area} fill={`url(#grad-${id})`} />

            {/* Secondary Area Fill & Line (if dual data like Network) */}
            {secondaryPath && (
                <>
                    <path d={secondaryPath.area} fill={`url(#grad-sec-${id})`} />
                    <path
                        d={secondaryPath.line}
                        fill="none"
                        stroke={secondaryColor}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            )}

            {/* Primary Smooth Curve Line */}
            <path
                d={primaryPath.line}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default () => {
    const { t } = useTranslation('vantablack/utilities');
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, rx: 0, tx: 0 });
    const [rate, setRate] = useState<{ rxSec: number; txSec: number }>({ rxSec: 0, txSec: 0 });

    const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(20).fill(0));
    const [memoryHistory, setMemoryHistory] = useState<number[]>(() => Array(20).fill(0));
    const [rxHistory, setRxHistory] = useState<number[]>(() => Array(20).fill(0));
    const [txHistory, setTxHistory] = useState<number[]>(() => Array(20).fill(0));

    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<{ rx: number | null; tx: number | null }>({ rx: null, tx: null });

    useEffect(() => {
        if (status === 'offline') {
            setCpuHistory(Array(20).fill(0));
            setMemoryHistory(Array(20).fill(0));
            setRxHistory(Array(20).fill(0));
            setTxHistory(Array(20).fill(0));
            setRate({ rxSec: 0, txSec: 0 });
            setStats({ memory: 0, cpu: 0, rx: 0, tx: 0 });
            previous.current = { rx: null, tx: null };
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        if (!values || !values.network) return;

        let rxDelta = 0;
        let txDelta = 0;

        // PREVENT INITIAL SPIKE: On first packet, initialize base cumulative bytes and emit 0 delta
        if (previous.current.rx === null || previous.current.rx < 0) {
            previous.current.rx = values.network.rx_bytes;
            previous.current.tx = values.network.tx_bytes;
            rxDelta = 0;
            txDelta = 0;
        } else {
            rxDelta = Math.max(0, values.network.rx_bytes - previous.current.rx);
            txDelta = Math.max(0, values.network.tx_bytes - previous.current.tx);
            previous.current.rx = values.network.rx_bytes;
            previous.current.tx = values.network.tx_bytes;
        }

        const currentCpu = Number(values.cpu_absolute || 0);
        const currentMemory = Number(values.memory_bytes || 0);

        setStats({
            memory: currentMemory,
            cpu: currentCpu,
            tx: values.network.tx_bytes,
            rx: values.network.rx_bytes,
        });

        setRate({
            rxSec: rxDelta,
            txSec: txDelta,
        });

        setCpuHistory((prev) => [...prev.slice(1), currentCpu]);
        setMemoryHistory((prev) => [...prev.slice(1), Math.floor(currentMemory / 1024 / 1024)]);
        setRxHistory((prev) => [...prev.slice(1), rxDelta]);
        setTxHistory((prev) => [...prev.slice(1), txDelta]);
    });

    const cpuMax = limits.cpu > 0 ? limits.cpu : Math.max(100, ...cpuHistory);
    const memLimitMb = limits.memory > 0 ? limits.memory : Math.max(512, ...memoryHistory);
    const memoryLimitStr = limits.memory ? bytesToString(mbToBytes(limits.memory)) : '∞';
    const netMax = Math.max(1024, ...rxHistory, ...txHistory);

    return (
        <>
            {/* 1. CPU LOAD */}
            <ChartBlock
                title={t('cpu-usage') || 'CPU Load'}
                type={'cpu'}
                prominentValue={`${stats.cpu.toFixed(2)}%`}
                limit={limits.cpu ? limits.cpu + '%' : '∞'}
                usage={`${stats.cpu.toFixed(2)}%`}
            >
                <Sparkline id="cpu" data={cpuHistory} maxVal={cpuMax} strokeColor="#10b981" />
            </ChartBlock>

            {/* 2. MEMORY USAGE */}
            <ChartBlock
                title={t('memory-usage') || 'Memory Usage'}
                type={'memory'}
                prominentValue={bytesToString(stats.memory)}
                limit={memoryLimitStr}
                usage={bytesToString(stats.memory)}
            >
                <Sparkline id="memory" data={memoryHistory} maxVal={memLimitMb} strokeColor="#06b6d4" />
            </ChartBlock>

            {/* 3. NETWORK TRAFFIC */}
            <ChartBlock
                type={'network'}
                title={t('inbound-outbound') || 'Network Traffic'}
                prominentValue={`${bytesToString(rate.rxSec)}/s`}
                inbound={`${bytesToString(rate.rxSec)}/s`}
                outbound={`${bytesToString(rate.txSec)}/s`}
            >
                <Sparkline
                    id="network"
                    data={rxHistory}
                    strokeColor="#06b6d4"
                    secondaryData={txHistory}
                    secondaryColor="#10b981"
                    maxVal={netMax}
                />
            </ChartBlock>
        </>
    );
};

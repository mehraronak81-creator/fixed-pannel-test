import React from 'react';
import { ServerContext } from '@/state/server';
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
    const isOffline = status === 'offline';

    return (
        <section className={'bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 transition-all duration-300 shadow-xl flex flex-col justify-between hover:border-white/20 relative group'}>
            <header className={'flex items-start justify-between gap-3 mb-2'}>
                <div className={'flex items-center gap-2.5'}>
                    <div className={'w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300'}>
                        {type === 'cpu' ? (
                            <ChipIcon className={'w-4 h-4 text-emerald-400'} />
                        ) : type === 'network' ? (
                            <CloudIcon className={'w-4 h-4 text-cyan-400'} />
                        ) : (
                            <LuMemoryStick className={'w-4 h-4 text-cyan-400'} />
                        )}
                    </div>
                    <div>
                        <p className={'text-xs font-semibold uppercase tracking-wider text-neutral-400'}>{title}</p>
                    </div>
                </div>

                {/* Top-Right Badge as required */}
                <div>
                    {type === 'cpu' ? (
                        <span className={'px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}>
                            {isOffline ? 'Offline' : usage || '0%'}
                        </span>
                    ) : type === 'memory' ? (
                        <span className={'px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'}>
                            {isOffline ? 'Offline' : `${usage || '0 MiB'} / ${limit || '∞'}`}
                        </span>
                    ) : (
                        <div className={'flex items-center gap-1.5'}>
                            <span className={'px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'} title="Inbound Traffic">
                                ↓ {isOffline ? '0 B' : inbound || '0 B'}
                            </span>
                            <span className={'px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'} title="Outbound Traffic">
                                ↑ {isOffline ? '0 B' : outbound || '0 B'}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            <div className={'w-full h-28 relative'}>
                {children}
            </div>
        </section>
    );
};
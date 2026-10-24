import React from 'react';
import { ServerContext } from '@/state/server';
import { ChipIcon, CloudIcon } from '@heroicons/react/outline';
import { LuMemoryStick } from 'react-icons/lu';

interface ChartBlockProps {
    type: 'cpu' | 'memory' | 'network';
    title: string;
    prominentValue?: string;
    usage?: string;
    limit?: string;
    inbound?: string;
    outbound?: string;
    children: React.ReactNode;
}

export default ({ type, title, prominentValue, usage, limit, inbound, outbound, children }: ChartBlockProps) => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const isOffline = status === 'offline';

    return (
        <section className={'bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 transition-all duration-300 shadow-xl flex flex-col justify-between hover:border-white/20 relative overflow-hidden group'}>
            <header className={'flex items-start justify-between gap-3 mb-3'}>
                <div>
                    <div className={'flex items-center gap-2 mb-1.5'}>
                        <div className={'w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300'}>
                            {type === 'cpu' ? (
                                <ChipIcon className={'w-3.5 h-3.5 text-emerald-400'} />
                            ) : type === 'network' ? (
                                <CloudIcon className={'w-3.5 h-3.5 text-cyan-400'} />
                            ) : (
                                <LuMemoryStick className={'w-3.5 h-3.5 text-cyan-400'} />
                            )}
                        </div>
                        <p className={'text-[11px] font-semibold uppercase tracking-wider text-neutral-400'}>{title}</p>
                    </div>
                    {/* Prominent live value */}
                    <div className={'text-xl font-bold text-white tracking-tight'}>
                        {isOffline ? 'Offline' : (prominentValue || usage || '0')}
                    </div>
                </div>

                {/* Top-Right Badge alongside unit */}
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

            {/* Bounded Graph Area */}
            <div className={'w-full h-20 relative overflow-hidden'}>
                {children}
            </div>
        </section>
    );
};
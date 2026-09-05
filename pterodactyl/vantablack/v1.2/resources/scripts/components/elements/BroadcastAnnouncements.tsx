import React, { useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { LuInfo, LuAlertTriangle, LuAlertCircle, LuCheckCircle2, LuXCircle } from 'react-icons/lu';
import parser from 'bbcode-to-react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Banner = styled.div`
    ${tw`mx-auto w-full flex items-center gap-x-3 max-w-[1200px] px-4 py-3 mt-4 rounded-component text-gray-100 !border-t-0 !border-r-0 !border-b-0`};
    border-left: var(--radiusInput) solid;

    & > svg {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    &.info {
        ${tw`bg-[#0a7fe633] !border-[#0a7fe6]`};
    }
    &.success {
        ${tw`bg-[#0da22c33] !border-[#0da22c]`};
    }
    &.warning {
        ${tw`bg-[#d7c21933] !border-[#d7c219]`};
    }
    &.danger {
        ${tw`bg-[#d7191933] !border-[#d71919]`};
    }
`;

const STORAGE_PREFIX = 'vh:broadcast:dismissed:';

const iconFor = (type: string) => {
    switch (type) {
        case 'success':
            return <LuCheckCircle2 />;
        case 'warning':
            return <LuAlertCircle />;
        case 'danger':
            return <LuAlertTriangle />;
        default:
            return <LuInfo />;
    }
};

interface Props {
    // When provided, only global broadcasts and broadcasts targeting this node id are shown.
    nodeId?: number | null;
}

const BroadcastAnnouncements = ({ nodeId }: Props) => {
    const allBroadcasts = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.broadcasts) || [];
    // Dashboard (no nodeId prop) shows every active broadcast. A specific server
    // page shows global broadcasts plus those targeting its own node.
    const broadcasts =
        typeof nodeId === 'number' ? allBroadcasts.filter((b) => b.nodeId === null || b.nodeId === nodeId) : allBroadcasts;

    const initialDismissed = () => {
        const set = new Set<number>();
        broadcasts.forEach((b) => {
            if (localStorage.getItem(`${STORAGE_PREFIX}${b.id}`)) {
                set.add(b.id);
            }
        });
        return set;
    };

    const [dismissed, setDismissed] = useState<Set<number>>(initialDismissed);

    const handleDismiss = (id: number) => {
        localStorage.setItem(`${STORAGE_PREFIX}${id}`, Date.now().toString());
        setDismissed((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const visible = broadcasts.filter((b) => !dismissed.has(b.id));

    if (visible.length === 0) {
        return null;
    }

    return (
        <div className={'px-4'}>
            {visible.map((b) => (
                <Banner key={b.id} className={`${b.type} backdrop`}>
                    {iconFor(b.type)}
                    <div className={'flex-1 min-w-0'}>
                        <p className={'font-semibold leading-tight'}>{b.title}</p>
                        <div className={'text-sm opacity-90'}>{parser.toReact(b.content)}</div>
                    </div>
                    {b.dismissible && (
                        <button
                            className={'ml-auto p-2 hover:bg-white/20 duration-300 rounded'}
                            onClick={() => handleDismiss(b.id)}
                            aria-label={'Dismiss announcement'}
                        >
                            <LuXCircle />
                        </button>
                    )}
                </Banner>
            ))}
        </div>
    );
};

export default BroadcastAnnouncements;

import React from 'react';
import { ServerContext } from '@/state/server';
import { getEggBanner } from '@/components/dashboard/eggBanner';

const Banner = () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const banner = getEggBanner(server);

    return(
        <div className={'lg:col-span-2'}>
            <div className={'bg-center bg-no-repeat bg-cover w-full h-[25vh] rounded-box max-h-[250px] relative overflow-hidden border border-gray-500'} css={`background-image:url(${banner})`}>
                <div className={'absolute inset-0'} css={'background:linear-gradient(180deg, transparent 40%, var(--gray800) 100%);'} />
                <div className={'absolute bottom-4 left-5 z-10'}>
                    <p className={'text-white font-semibold text-lg drop-shadow-lg'}>{server.name}</p>
                </div>
            </div>
        </div>
    )
}

export default Banner;

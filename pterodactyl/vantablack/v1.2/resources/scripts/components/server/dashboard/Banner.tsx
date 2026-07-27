import React from 'react';
import { ServerContext } from '@/state/server';

const Banner = () => {
    const eggImage = ServerContext.useStoreState((state) => state.server.data!.eggImage);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);

    return(
        <div className={'lg:col-span-2'}>
            <div className={'bg-center bg-no-repeat bg-cover w-full h-[25vh] rounded-box max-h-[250px] relative overflow-hidden border border-gray-500'} css={`background-image:url(${eggImage ? eggImage : '/vantablack/minecraft-banner.png'})`}>
                <div className={'absolute inset-0'} css={'background:linear-gradient(180deg, transparent 40%, var(--gray800) 100%);'} />
                <div className={'absolute bottom-4 left-5 z-10'}>
                    <p className={'text-white font-semibold text-lg drop-shadow-lg'}>{name}</p>
                </div>
            </div>
        </div>
    )
}

export default Banner;

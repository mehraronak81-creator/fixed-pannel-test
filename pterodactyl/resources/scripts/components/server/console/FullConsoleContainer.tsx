import React from 'react';
import Spinner from '@/components/elements/Spinner';
import Console from '@/components/server/console/Console';

const FullConsoleContainer = () => {

    return (
        <div className={'min-h-screen bg-gray-900'}>
            <Spinner.Suspense>
                <Console fullConsole/>
            </Spinner.Suspense>
        </div>
    );
};

export default FullConsoleContainer;

import React from 'react';
import { Server } from '@/api/server/getServer';
import ServerCard from './ServerCard';

export default ({ server }: { server: Server }) => {
    return <ServerCard server={server} />;
};

import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import Spinner from '@/components/elements/Spinner';
import { useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation, useHistory } from 'react-router-dom';
import Select from '@/components/elements/Select';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('vantablack/navigation');
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [ page, setPage ] = useState((!isNaN(defaultPage) && defaultPage > 0) ? defaultPage : 1);
    const uuid = useStoreState(state => state.user.data!.uuid);
    
    const { data: servers } = useSWR<PaginatedResult<Server>>(
        [ '/api/client/servers', page ],
        () => getServers({ page }),
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [ servers?.pagination.currentPage ]);

    const history = useHistory();

    const handleChange = (value: string) => {
        history.push(value)
    }

    return (
        <div className={'w-[250px]'}>
            <Select
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleChange(event.target.value)}
                value={(window.location.pathname.split('/',3).join('/'))}
                className={'selection-container'}
                css={`
                    background-color: rgba(10, 10, 12, 0.9) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #ffffff !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border-radius: 0.5rem !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;

                    & option {
                        background: #08080a !important;
                        color: #ffffff !important;
                    }
                `}
            >
                <option value={`/`} css="display:none;">
                    {t('select-a-server')}
                </option>
                {!servers ?
                    <Spinner centered size={'small'}/>
                    :
                    <Pagination data={servers} onPageSelect={setPage}>
                        {({ items }) => (
                            items.length > 0 ?
                                items.map((server, index) => (
                                    <option value={`/server/${server.id}`} key={server.uuid}>
                                        {server.name}
                                    </option>
                                ))
                                :
                                <option value={`/`}>
                                    {t('no-servers')}
                                </option>
                        )}
                    </Pagination>
                }
            </Select>
        </div>
    );
};
import React from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import LavalinkContainer from '@/components/lavalink/LavalinkContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import Alert from '@/components/elements/VantaAnnouncement';
import BroadcastAnnouncements from '@/components/elements/BroadcastAnnouncements';
import TransitionRouter from '@/TransitionRouter';
import SideBarIcon from '@/components/SideBarIcon';
import { useLocation } from 'react-router-dom';
import Spinner from '@/components/elements/Spinner';
import SideBar from '@/components/SideBar';
import routes from '@/routers/routes';

export default () => {
    const location = useLocation();
    const layout = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.layout);
    const backgroundImage = useStoreState((state: ApplicationStore) => state.settings.data!.vantablack.backgroundImage);

    return (
        <>
        <div className={'min-h-screen flex h-full bg-transparent'}>
            {(layout == 1 || layout == 2) && <SideBar />}
            {layout == 4 && <SideBarIcon/>}
            <div className="w-full">
                <NavigationBar />
                <Alert />
                <BroadcastAnnouncements />
                <TransitionRouter>
                    <React.Suspense fallback={<Spinner centered />}>
                        <Switch location={location}>
                            <Route path={'/'} exact>
                                <DashboardContainer />
                            </Route>
                            <Route path={'/lavalink'} exact>
                                <LavalinkContainer />
                            </Route>
                            {routes.account.map(({ path, component: Component }) => (
                                <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                    <Component />
                                </Route>
                            ))}
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </React.Suspense>
                </TransitionRouter>
            </div>
        </div>
        </>
    );
};

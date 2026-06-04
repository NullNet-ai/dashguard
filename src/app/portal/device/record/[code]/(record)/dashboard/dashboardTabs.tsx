import { headers } from 'next/headers';
import { Suspense, lazy } from 'react';
import StateTab from '~/components/platform/StateTab';
import { Loader } from '~/components/ui/loader';
import { api } from '~/trpc/server';
import OfflineWarning from './offlineWarning';
import SidebarTab from '~/components/platform/SidebarTab';
import { Clock, Map, TrendingUp } from 'lucide-react';

// Lazy load components
const Timeline = lazy(
  () => import('../../_components/dashboard/timeline/server'),
);
const InteractiveGraph = lazy(
  () => import('../../_components/dashboard/multi-graph/server'),
);

const TrafficMaps = lazy(
  () => import('../../_components/dashboard/Map/traffic-map-leaflet/server'),
);

const PieChartComponent = lazy(
  () => import('../../_components/dashboard/pie-chart/client'),
);

const TrafficGraph = lazy(
  () => import('../../_components/dashboard/traffic-graph/server'),
);


export default async function DashboardTabs() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');
  // Should Refetch Every ??
  
  const fetched_device = identifier
    ? await api.record.getByCode({
        id: identifier!,
        pluck_fields: ['is_device_online', 'device_category'],
        main_entity: main_entity!,
      })
    : null;
  const isDeviceOnline = fetched_device?.data?.is_device_online;
  const deviceCategory = fetched_device?.data?.device_category;

  const tabs = [
    {
      id: 'live_graph',
      label: 'Graphs',
      icon: <TrendingUp size={16} />,
      content: (
        <Suspense
          fallback={
            <div className="flex h-[500px] w-full items-center justify-center">
              <div className="flex items-center justify-center">
                <Loader
                  className="h-8 w-8 bg-primary text-primary"
                  label=""
                  variant="spinner"
                />
              </div>
            </div>
          }
        >
          {deviceCategory === 'Firewall' && <InteractiveGraph />}

          <div className="mt-2">
            <TrafficGraph />
          </div>
        </Suspense>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Clock size={16} />,
      content: (
        <Suspense
          fallback={
            <div className="flex h-[500px] w-full items-center justify-center">
              <div className="flex items-center justify-center">
                <Loader
                  className="h-8 w-8 bg-primary text-primary"
                  label=""
                  variant="spinner"
                />
              </div>
            </div>
          }
        >
          <OfflineWarning isOnline={isDeviceOnline} />
          <Timeline />
        </Suspense>
      ),
    },
    {
      id: 'map',
      label: 'Map',
      icon: <Map size={16} />,
      content: (
        <Suspense
          fallback={
            <div className="flex h-[500px] w-full items-center justify-center">
              <div className="flex items-center justify-center">
                <Loader
                  className="h-8 w-8 bg-primary text-primary"
                  label=""
                  variant="spinner"
                />
              </div>
            </div>
          }
        >
          <OfflineWarning isOnline={isDeviceOnline} />
          < TrafficMaps />
        </Suspense>
      ),
    }
  ];

  return (
    <div className="space-y-2">
      <SidebarTab
        defaultValue="live_graph"
        isStickyContainer
        stickyClassName="top-[50px]"
        persistKey={`dashboard_graphs-${identifier}`}
        tabs={tabs}
      />
    </div>
  );
}
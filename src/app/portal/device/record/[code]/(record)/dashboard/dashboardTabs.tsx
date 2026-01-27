import { headers } from 'next/headers';
import { Suspense, lazy } from 'react';
import StateTab from '~/components/platform/StateTab';
import { Loader } from '~/components/ui/loader';

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
  const [, , , , identifier] = pathname.split('/');
  // Should Refetch Every ??
  


  const tabs = [
    {
      id: 'live_graph',
      label: 'Live Graph',
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
          <InteractiveGraph />

          <div className="mt-2">
            <TrafficGraph />
          </div>
        </Suspense>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
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
          <Timeline />
        </Suspense>
      ),
    },
    {
      id: 'map',
      label: 'Map',
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
          < TrafficMaps />
        </Suspense>
      ),
    }
  ];

  return (
    <div className="space-y-2">
      <div className="">
        <StateTab
          defaultValue="live_graph"
          orientation="vertical"
          rotateText={true}
          persistKey={`dashboard_graphs-${identifier}`}
          tabs={tabs}
          variant="underline"
          size='sm'
        />
      </div>
    </div>
  );
}
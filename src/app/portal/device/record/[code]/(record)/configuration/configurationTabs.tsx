import { headers } from 'next/headers';
import { Suspense, lazy } from 'react';
import StateTab from '~/components/platform/StateTab';
import { Loader } from '~/components/ui/loader';

// Lazy load components
const ConfigurationRule = lazy(
  () => import('../../../../_components/record_configuration/ConfigurationRuleGrid'),
);

const ConfigurationNatRule = lazy(
  () => import('../../../../_components/record_configuration/ConfigurationNatRuleGrid'),
);
const ConfigurationAlias = lazy(
  () => import('../../../../_components/record_configuration/ConfigurationAliasGrid'),
);

const ConfigurationRawData = lazy(
  () => import('../../../../_components/record_configuration/ConfigurationRawData'),
);

export default async function DashboardTabs() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');
  // Should Refetch Every ??
  


  const tabs = [
    {
      id: 'configuration_rules',
      label: 'Rules',
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
          <ConfigurationRule code={identifier || ""}/>
        </Suspense>
      ),
    },
    {
      id: 'configuration_nat_rules',
      label: 'NAT',
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
          <ConfigurationNatRule code={identifier || ""}/>
        </Suspense>
      ),
    },
    {
      id: 'configuration_aliases',
      label: 'Aliases',
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
          <ConfigurationAlias code={identifier || ""}/>
        </Suspense>
      ),
    },
    // {
    //   id: 'configuration_raw_data',
    //   label: 'Raw Data',
    //   content: (
    //     <Suspense
    //       fallback={
    //         <div className="flex h-[500px] w-full items-center justify-center">
    //           <div className="flex items-center justify-center">
    //             <Loader
    //               className="h-8 w-8 bg-primary text-primary"
    //               label=""
    //               variant="spinner"
    //             />
    //           </div>
    //         </div>
    //       }
    //     >
    //       < ConfigurationRawData />
    //     </Suspense>
    //   ),
    // }
  ];

  return (
    <div className="space-y-2">
      <div className="">
        <StateTab
          defaultValue="configuration_rules"
          orientation="vertical"
          rotateText={true}
          persistKey={`configuration_rule-${identifier}`}
          tabs={tabs}
          variant="underline"
          size='sm'
        />
         {/* <StateTab
          defaultValue="filter"
          persistKey="side-drawer-tabs"
          tabs={tabs}
          
          size="sm"
        /> */}
      </div>
    </div>
  );
}
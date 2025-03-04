'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import LinkTab from "~/components/platform/LinkTab";
import { useTabPersistence } from "~/components/platform/LinkTab/hooks/useTabPersistence";

const RecordLayout: React.FC<any> = (props) => {
  const { params, children, timeline, traffic_graph, map, ...rest } = props;
  const pathName = usePathname()
  const {pie_chart, multi_graph} = rest
  const router = useRouter()
  const RenderComponents = [multi_graph].filter(Boolean)  
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('sub_tab')
    const { currentPath } = useTabPersistence({
      code: params.code,
      prefix: 'dashboard-tab',
    })
  const baseUrl = `${pathName}?current_tab=dashboard`

  const tabs = [
    {
      id: 'timeline',
      label: 'Timeline',
      href: `${baseUrl}&sub_tab=timeline`,
    },
    {
      id: 'traffic_graph',
      label: 'Traffic Graph',
      href: `${baseUrl}&sub_tab=traffic_graph`,
    },
    {
      id: 'map',
      label: 'Map',
      href: `${baseUrl}&sub_tab=map`,
    },
  ]

   const Content = React.useMemo(() => {
      const renderContent = () => {
        switch (currentTab) {
          case 'timeline':
            return <div style={{ display: 'block' }}>{timeline}</div>
          case 'traffic_graph':
            return <div style={{ display: 'block' }}>{traffic_graph}</div>
          case 'map':
            return <div style={{ display: 'block' }}>{map}</div>
          default:
            router.push(`${baseUrl}&sub_tab=rules`)
            return null
        }
      }
  
      return (
        <Suspense fallback={<div>Loading...</div>}>{renderContent()}</Suspense>
      )
    }, [searchParams, timeline, traffic_graph, map, baseUrl])
  

  return <div className="grid grid-cols-1 gap-2">
    {RenderComponents}<LinkTab
        defaultHref={`${baseUrl}?current_tab=dashboard&tab=timeline`}
        orientation="horizontal"
        persistKey={currentPath}
        size="sm"
        tabs={tabs}
        variant="default"
      /> {Content}
      </div>;
};

export default RecordLayout;

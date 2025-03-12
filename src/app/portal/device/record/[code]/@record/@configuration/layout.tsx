'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

import LinkTab from '~/components/platform/LinkTab'
import { useTabPersistence } from '~/components/platform/LinkTab/hooks/useTabPersistence'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import ConfigHistoryGrid from '../../../_components/ConfigVersionHistory/grid/page'

interface RecordLayoutProps {
  params: { code: string }
  searchParams: { current_tab?: string, tab?: string }
  rules: React.ReactNode
  aliases: React.ReactNode
  raw_data: React.ReactNode
}

const RecordLayout: React.FC<RecordLayoutProps> = (props) => {
  const { params, rules, aliases, raw_data } = props || {}
  const { actions } = useSideDrawer()
  const { openSideDrawer } = actions
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const currentTab = searchParams.get('sub_tab')
  const router = useRouter()
  const { currentPath } = useTabPersistence({
    code: params.code,
    prefix: 'configuration-tab',
  })

  const baseUrl = `${pathName}?current_tab=configuration`
  const tabs = [
    {
      id: 'rules',
      label: 'Rules',
      href: `${baseUrl}&sub_tab=rules`,
    },
    {
      id: 'aliases',
      label: 'Aliases',
      href: `${baseUrl}&sub_tab=aliases`,
    },
    {
      id: 'raw_data',
      label: 'Raw Data',
      href: `${baseUrl}&sub_tab=raw_data`,
    },
  ]

  // Redirect to users tab if current tab is invalid
  // useEffect(() => {
  //   if (!currentTab || !['dashboard', 'users'].includes(currentTab)) {
  //     router.replace(`${baseUrl}?current_tab=dashboard&tab=dashboard`);
  //   }
  // }, [currentTab]);

  const Content = React.useMemo(() => {
    const renderContent = () => {
      switch (currentTab) {
        case 'rules':
          return <div style={{ display: 'block' }}>{rules}</div>
        case 'aliases':
          return <div style={{ display: 'block' }}>{aliases}</div>
        case 'raw_data':
          return <div style={{ display: 'block' }}>{raw_data}</div>
        default:
          router.push(`${baseUrl}&sub_tab=rules`)
          return null
      }
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>{renderContent()}</Suspense>
    )
  }, [searchParams, rules, aliases, baseUrl])

  const handleOpenSideDrawer = () => {
    openSideDrawer?.({
      title: 'Configuration 1 Version History',
      sideDrawerWidth: '30dvw',
      body: {
        component: ConfigHistoryGrid,
        componentProps: {
          params,
          userId: '123',
          onSave: () => {
          },
        },
      },
      header: undefined
    })
  }

  return (
    <div className="space-y-4 flex flex-col">
      <Button className='ml-auto' onClick={handleOpenSideDrawer}>Config History</Button>
      <LinkTab
        defaultHref={`${baseUrl}?current_tab=dashboard&tab=users`}
        orientation="horizontal"
        persistKey={currentPath}
        size="sm"
        tabs={tabs}
        variant="default"
      />
      {Content}
    </div>
  )
}

export default RecordLayout

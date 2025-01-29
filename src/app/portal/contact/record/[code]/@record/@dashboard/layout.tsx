'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import React, { Suspense, useEffect } from 'react'

import LinkTab from '~/components/platform/LinkTab'

interface RecordLayoutProps {
  params: { code: string }
  searchParams: { current_tab?: string; tab?: string }
  A: React.ReactNode
  B: React.ReactNode
}

const RecordLayout: React.FC<RecordLayoutProps> = (props) => {
  const { params, A, B } = props
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')
  const router = useRouter()
  // const { currentPath } = useTabPersistence({
  //   code: params.code,
  //   prefix: "dashboard-tab",
  // });

  const baseUrl = `/portal/contact/record/${params.code}`
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: `${baseUrl}?current_tab=dashboard&tab=dashboard`,
    },
    {
      id: 'users',
      label: 'Users',
      href: `${baseUrl}?current_tab=dashboard&tab=users`,
    },
  ]

  // Redirect to users tab if current tab is invalid
  useEffect(() => {
    if (!currentTab || !['dashboard', 'users'].includes(currentTab)) {
      router.replace(`${baseUrl}?current_tab=dashboard&tab=dashboard`)
    }
  }, [currentTab])

  const Content = React.useMemo(() => {
    const renderContent = () => {
      switch (currentTab) {
        case 'dashboard':
          return <div style={{ display: 'block' }}>{A}</div>
        case 'users':
          return <div style={{ display: 'block' }}>{B}</div>
        default:
          return <div>Loading...</div>
      }
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>{renderContent()}</Suspense>
    )
  }, [searchParams, A, B, baseUrl])

  return (
    <div className="space-y-4">
      <LinkTab
        tabs={tabs}
        variant="default"
        size="md"
        orientation="horizontal"
        defaultHref={`${baseUrl}?current_tab=dashboard&tab=users`}
        // persistKey={currentPath}
      />
      {Content}
    </div>
  )
}

export default RecordLayout

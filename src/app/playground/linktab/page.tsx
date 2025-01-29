import { headers } from 'next/headers'

import React from 'react'

import LinkTab from '~/components/platform/LinkTab'

export default function Page() {
  const headerList = headers()
  const pathname = headerList.get('x-full-pathname') || ''

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: pathname,
      //   icon: <div>HALLO</div>,
    },
    {
      id: 'users',
      label: 'Users',
      href: '/users',
      //   icon: <div>HALLO 1</div>,
    },
  ]

  return (
    <LinkTab tabs={tabs} variant="default" size="md" orientation="horizontal" />
  )
}

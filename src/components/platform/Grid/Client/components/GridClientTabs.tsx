'use client'

import { useState } from 'react'

import { toCapitalize } from '~/lib/capitalize'
import { cn } from '~/lib/utils'
import { type ITabGrid } from '~/server/api/types'

import GridTabMenu from './GridTabMenu'

const GridClientTabs = () => {
  const [tabs] = useState<ITabGrid[]>([
    {
      id: 'all',
      name: 'All',
      current: false,
      href: '/grid/all',
    },
  ])

  return (
    <div className="flex flex-row gap-2 h-full">
      {tabs?.map((tab) => {
        const active = tab.current ? 'text-primary' : 'text-foreground'
        const entity = tab?.href?.split('/').at(2)
        const applicationType = tab?.href?.split('/').at(3)?.split('?')[0]

        return (
          <a
            href={tab?.href}
            key={tab.id}
            data-test-id={(entity + '-' + applicationType + '-tab-' + tab.name.split(' ').join('-').toLowerCase()) || 'tab'}
            className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm"
          >
            <span className={cn(active, '')}>{toCapitalize(tab.name)}</span>
            <GridTabMenu tab={tab} filter_id={tab?.id} />
          </a>
        )
      })}
    </div>
  )
};

export default GridClientTabs

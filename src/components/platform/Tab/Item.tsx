'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Fragment, useEffect, useMemo } from 'react'

import { cn, formatTabName } from '~/lib/utils'
import { api } from '~/trpc/react'

import CloseTab from './CloseKebab'
import { type IActions } from './TabItems'

type ItemProps = {
  tab: any
  actions: IActions
}

const Item = ({ tab, actions }: ItemProps) => {
  const padding = tab.name === 'dashboard' ? 'pr-2' : 'pr-0'
  const tabNameRole = tab.name === 'user_role'? 'role' : tab.name.split(' ').join('-').toLowerCase()
  const updateTabs = api.tab.updateMainTabs.useMutation()
  const pathname = usePathname()
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/')

  const isActive = useMemo(() => {
    const [, , entityName] = (tab.href || '').split('/')
    return entityName === entity
  }, [entity])

  useEffect(() => {
    updateTabs.mutateAsync({
      tab_name: entity!,
      is_active: isActive,
    })
  }, [isActive])

  return (
    <Fragment key={tab.name}>
      <div className="group relative flex items-center">
        <Link
          data-test-id={
            'mntab-'
            + tabNameRole
          }
          href={tab.href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive
              ? 'rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary text-primary'
              : 'text-gray-500', 'max-h-[32px] whitespace-nowrap px-[8px] xx py-1 text-sm font-medium', 'flex items-center space-x-2 pl-[4px]', 'relative hover:border-t-primary hover:text-primary', padding
          )}
        >
          {formatTabName(tabNameRole)}
          <CloseTab actions={actions} {...tab} />
          {isActive && (
            <span className={cn(`absolute bottom-[-2px] md:bottom-[-6px] lg:bottom-[-4px] z-10 h-1 w-full bg-white`, 
              `${tab.name === 'dashboard' || tab.name ==='grid' ? 'left-0 bottom-[-4px]' : 'left-[-8px]' }`)} />
          )}
        </Link>
      </div>
    </Fragment>
  )
}


export default Item

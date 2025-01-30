'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Fragment, useMemo } from 'react'

import { cn, formatAndCapitalize } from '~/lib/utils'

import CloseTab from './CloseKebab'

type ItemProps = {
  tab: any
}

const Item = ({ tab }: ItemProps) => {
  const padding = tab.name === 'dashboard' ? 'pr-2' : 'pr-0'
  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false

  const pathname = usePathname()
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/')

  const isActive = useMemo(() => {
    const [, , entityName] = (tab.href || '').split('/')
    return entityName === entity
  }, [entity])

  return (
    <Fragment key={checkIfUserRole(tab.name) ? 'role' : tab.name}>
      <div className="group relative flex items-center">
        <Link
          data-test-id={
            'mntab-'
            + (checkIfUserRole(tab.name) ? 'role' : tab.name)
              .split(' ')
              .join('-')
              .toLowerCase()
          }
          href={tab.href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive
              ? 'rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary text-primary'
              : 'text-gray-500', 'max-h-[32px] whitespace-nowrap px-[8px] py-1 text-sm font-medium', 'flex items-center space-x-2 pl-[8px]', 'relative hover:border-t-primary hover:text-primary', padding,
          )}
        >
          {formatAndCapitalize(checkIfUserRole(tab.name) ? 'role' : tab.name)}
          {}
          <CloseTab {...tab} />
        </Link>

        {isActive && (
          <div className="absolute bottom-[-4px] z-10 h-1 w-full bg-white" />
        )}
      </div>
    </Fragment>
  )
};

export default Item

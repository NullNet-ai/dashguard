'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo } from 'react'

import { cn, formatAndCapitalize } from '~/lib/utils'

import CloseTab from './CloseKebab'
interface ItemProps {
  tab: any
}

const Item = (props: ItemProps) => {
  const padding = props.tab.name === 'dashboard' ? 'pr-4' : 'pr-0'
  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false

  const pathname = usePathname()
  const [, , entity] = pathname ? pathname.split('/') : ['', '', '']

  const isActive = useMemo(() => {
    const [, , entityName] = (props.tab.href || '').split('/')
    return entityName === entity
  }, [entity])

  return (
    <Fragment key={checkIfUserRole(props.tab.name) ? 'role' : props.tab.name}>
      <div className="group relative flex items-center">
        <Link
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive
              ? 'text-primary md:rounded-t-lg md:border-b-0 md:border-l md:border-r md:border-t-2 md:border-t-primary'
              : 'text-gray-500', 'whitespace-nowrap px-4 py-1.5 text-sm font-medium md:pt-2', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', padding,
          )}
          data-test-id={
            `mntab-${
              (checkIfUserRole(props.tab.name) ? 'role' : props.tab.name)
                .split(' ')
                .join('-')
                .toLowerCase()}`
          }
          href={props.tab.href}
        >
          {formatAndCapitalize(checkIfUserRole(props.tab.name) ? 'role' : props.tab.name)}
          <CloseTab {...props.tab} />
        </Link>

        {isActive && (
          <div className="absolute bottom-[-10px] z-10 h-1 w-full bg-white" />
        )}
      </div>
    </Fragment>
  )
}

export default Item

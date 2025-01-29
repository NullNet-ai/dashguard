'use client'

import Link from 'next/link'

import { usePathname, useSearchParams } from 'next/navigation'

import React, { Fragment, useEffect } from 'react'

import { LinkTabProvider, useLinkTab } from './Provider'

import { getTabStyles } from './tabStyles'

import { LinkTabProps } from './types'

export function LinkTabList({
  className,
  persistKey,
}: {
  className?: string
  persistKey?: string
}) {
  const {
    tabs,
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
  } = useLinkTab()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fullPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`

  // Persist active tab
  useEffect(() => {
    if (persistKey && fullPath) {
      localStorage.setItem(`tab-${persistKey}`, fullPath)
    }
  }, [fullPath, persistKey])

  // Restore persisted tab on mount
  useEffect(() => {
    if (persistKey) {
      const savedPath = localStorage.getItem(`tab-${persistKey}`)
      const _tabs = tabs.some((tab) => {
        return tab.href === savedPath
      })
      if (savedPath && _tabs) {
        window.history.replaceState({}, '', savedPath)
      }
    }
  }, [])

  const tabStyles = getTabStyles(orientation, className)

  return (
    <div className={tabStyles.container}>
      <div
        role="tablist"
        aria-orientation={orientation}
        className={tabStyles.tabList}
      >
        {tabs.map((tab) => {
          const isActive = fullPath === tab.href

          return (
            <Fragment key={tab.id}>
              <Link
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={tabStyles.tab(isActive, variant, size)}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                <span>{tab.label}</span>
              </Link>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

const LinkTab = ({
  tabs,
  variant,
  size,
  orientation,
  className,
  persistKey,
}: LinkTabProps & { persistKey?: string }) => {
  return (
    <LinkTabProvider value={{ tabs, variant, size, orientation }}>
      <LinkTabList className={className} persistKey={persistKey} />
    </LinkTabProvider>
  )
}

export default LinkTab

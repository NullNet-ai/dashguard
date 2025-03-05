/* eslint-disable jsx-a11y/click-events-have-key-events,
jsx-a11y/no-static-element-interactions */
'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { Separator } from '@radix-ui/react-select'
import React from 'react'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

import { useSideDrawer } from './SideDrawerProvider'
import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

export const SideDrawerView: React.FC = () => {
  const { state, actions } = useSideDrawer()
  const { closeSideDrawer } = actions
  const { config, isOpen } = state
  const {isBannerPresent} = useSidebar()

  const {
    header,
    body,
    sideDrawerWidth = '982px',
    overlayEnabled = false,
    closeOnOutsideClick = true,

  } = config || {}

  const { component: BodyComponent, componentProps } = body || {}

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && overlayEnabled) {
      closeSideDrawer()
    }
  }

  return (
    <div
      aria-labelledby='side-drawer-title'
      aria-modal='true'
      className={`fixed inset-0 z-[101] overflow-hidden transition-all ease-in-out  duration-500 ${isOpen && config ? 'translate-x-0' : 'translate-x-full'
      } ${overlayEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role='dialog'
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${overlayEnabled
          ? 'bg-black bg-opacity-50'
          : 'bg-transparent'
          } ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleOutsideClick}


      />

      {/* Drawer Content */}
      <Card
        className={cn(
          `fixed  z-[102] transition-none h-[calc(100dvh-48px)]   w-full md:w-[var(--drawer-width)] transform-gpu duration-800 ease-out
          bottom-0 left-0 right-0 md:top-auto md:right-0 md:bottom-0 md:left-auto
          ${isOpen ? 'translate-y-0 md:translate-x-0 pointer-events-auto' : 'pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full'}`,
          isBannerPresent ? 'md:h-[calc(100dvh-75px)]' : 'md:h-[calc(100dvh-48px)] lg:h-[calc(100dvh-43px)]'
        )}
        style={{ '--drawer-width': sideDrawerWidth } as React.CSSProperties}
      >
        {config && (
          <>
            <CardHeader className="flex items-center gap-4 p-3 pb-0 justify-between">
                {header}
              {/* <h1 className='text-md flex-grow font-bold' id='side-drawer-title'>
              </h1> */}
              <button
                aria-label='Close side drawer'
                data-test-id='side-drawer-close'
                onClick={closeSideDrawer}
                className="z-[103]"
              >
                <XMarkIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardHeader>

            <Separator />

            <CardContent className='flex flex-1 flex-col gap-2  h-full p-0'>
              {BodyComponent && <BodyComponent {...componentProps} />}
            </CardContent>

            <Separator />
          </>
        )}
      </Card>
    </div>
  )
}
/* eslint-disable jsx-a11y/click-events-have-key-events,
jsx-a11y/no-static-element-interactions */
'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { Separator } from '@radix-ui/react-select'
import React from 'react'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

import { useSideDrawer } from './SideDrawerProvider'

export const SideDrawerView: React.FC = () => {
  const { state, actions } = useSideDrawer()
  const { closeSideDrawer } = actions
  const { config, isOpen } = state

  const {
    title,
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
      className={`fixed inset-0 z-[101] overflow-hidden transition-opacity duration-300 ${isOpen && config ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
        className={`fixed  z-[102] h-[90vh] md:h-screen w-full md:w-[var(--drawer-width)] transform-gpu transition-all duration-500 ease-out
          bottom-0 left-0 right-0 md:top-0 md:right-0 md:bottom-auto md:left-auto
          ${isOpen ? 'translate-y-0 md:translate-x-0 pointer-events-auto' : 'pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full'}`}
        style={{ '--drawer-width': sideDrawerWidth } as React.CSSProperties}
      >
        {config && (
          <>
            <CardHeader className="flex items-center gap-4 p-3">
              <h1 className='text-md flex-grow font-bold' id='side-drawer-title'>
                {title}
              </h1>
              <button
                aria-label='Close side drawer'
                data-test-id='side-drawer-close'
                onClick={closeSideDrawer}
                className="z-[103]"
              >
                <XMarkIcon className="h-6 w-6 text-muted-foreground" />
              </button>
            </CardHeader>

            <Separator />

            <CardContent className='flex flex-1 flex-col gap-2 overflow-y-auto'>
              {BodyComponent && <BodyComponent {...componentProps} />}
            </CardContent>

            <Separator />
          </>
        )}
      </Card>
    </div>
  )
}
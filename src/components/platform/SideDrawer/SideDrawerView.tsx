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

  if (!isOpen || !config) return null
  const {
    title,
    body,
    sideDrawerWidth = '982px',
    overlayEnabled = false,
    closeOnOutsideClick = false,
  } = config

  const { component: BodyComponent, componentProps } = body

  return (
    <div
      aria-labelledby='side-drawer-title'
      aria-modal='true'
      className='fixed inset-0 z-50 overflow-hidden'
      role='dialog'
    >
      {overlayEnabled && (
        <div
          className={`absolute inset-0 transition-opacity ${overlayEnabled
            ? 'bg-black bg-opacity-50'
            : 'bg-transparent'}`}
          onClick={closeOnOutsideClick ? closeSideDrawer : undefined}
        />
      )}
      <Card
        className={`fixed top-0 h-screen z-50 transition-transform duration-500 drop-shadow-lg
          ease-in-out ${isOpen ? 'right-0' : `-right-[${sideDrawerWidth}]`}`}
        style={{ width: sideDrawerWidth }}
      >
        <CardHeader className="flex items-center gap-4 p-3">
          <h1 className='text-md flex-grow font-bold' id='side-drawer-title'>
            {title}
          </h1>
          <button
            aria-label='Close side drawer'
            data-test-id='side-drawer-close'
            onClick={closeSideDrawer}
          >
            <XMarkIcon className="h-6 w-6 text-muted-foreground" />
          </button>
        </CardHeader>

        <Separator />

        <CardContent className='flex h-[85%] flex-col items-center
        justify-center gap-2'
        >
          <BodyComponent {...componentProps} />
        </CardContent>

        <Separator />
      </Card>
    </div>

  )
}

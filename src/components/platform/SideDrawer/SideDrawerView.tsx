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
      className={`fixed inset-0 z-[101] overflow-hidden transition-opacity duration-300 ${
        isOpen && config ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${overlayEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role='dialog'
      onClick={handleOutsideClick}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          overlayEnabled 
            ? 'bg-black bg-opacity-50' 
            : 'bg-transparent'
        } ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Drawer Content */}
      <Card
        className={`fixed top-0 pointer-events-auto h-screen z-[102] transform-gpu transition-transform duration-500 ease-out right-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: sideDrawerWidth }}
      >
        {config && (
          <>
            <CardHeader className="flex items-center gap-4 p-3 ">
              <h1 className='text-md flex-grow font-bold' id='side-drawer-title'>
                {title}
              </h1>
              <button
                aria-label='Close side drawer'
                data-test-id='side-drawer-close'
                onClick={closeSideDrawer}
                className=" z-[103] "
              >
                <XMarkIcon className="h-6 w-6 text-muted-foreground" />
              </button>
            </CardHeader>

            <Separator />

            <CardContent className='flex h-[85%] flex-col items-center justify-center gap-2'>
              {BodyComponent && <BodyComponent {...componentProps} />}
            </CardContent>

            <Separator />
          </>
        )}
      </Card>
    </div>
  )
}
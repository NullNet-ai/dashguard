'use client'

import { MonitorCheck } from 'lucide-react'
import React from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import AuthorizaDeviceForm from './AuthorizeDeviceForm'

interface AuthorizeDeviceActionProps {
  row: {
    original: {
      id: string
      code: string
      is_device_online: boolean
      is_device_authorized: boolean
    }
  }
  viewMode?: 'table' | 'card'
  config?: Record<string, any>
}

export default function AuthorizeDeviceAction(
  props: AuthorizeDeviceActionProps,
) {
  const { row: {
    original: {
      code,
      is_device_online,
      is_device_authorized,
    },
  } } = props
  const {
    actions: { openSideDrawer },
  } = useSideDrawer()

  const disabled = React.useMemo(
    () => !is_device_authorized
      || !is_device_online, [is_device_authorized, is_device_online],
  )

  const handleOpenSideDrawer = React.useCallback(() => {
    openSideDrawer({
      header: (
        <h1>
          Authorize device
          {code}
        </h1>
      ),
      sideDrawerWidth: '500px',
      body: {
        component: () => (
          <div>
            <AuthorizaDeviceForm code={code} />
          </div>
        ),
        componentProps: {},
      },
    })
  }, [openSideDrawer, code])

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            disabled={disabled}
            variant='ghost'
            onClick={() => handleOpenSideDrawer()}
          >
            <MonitorCheck className='h-4 w-4 text-success' />
          </Button>
          <TooltipContent side='top'>
            <div className='text-sm'>
              <span className='text-justify'>Authorize Device</span>
            </div>
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}

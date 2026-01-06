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
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import SelectExistingRemoteAccess from '../../_components/forms/select-existing-remote-access'

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
      id,
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

  const handleOpenSideDrawer = React.useCallback((type) => {
    openSideDrawer({
      header: type === 'authorize_device' && (
        <h1>
          Authorize Device
          {code}
        </h1>
      ),
      sideDrawerWidth: '500px',
      body: {
        component: () => (
          type === 'remote_access' ? (
            <div>
              <SelectExistingRemoteAccess record_data={{
                id,
              }} />
            </div>
          ) : (
            <div>
              <AuthorizaDeviceForm code={code} />
            </div>
          )
        ),
        componentProps: {},
      },
    })
  }, [openSideDrawer, code])

  return (
    <TooltipProvider>
      {is_device_online && <Tooltip delayDuration={0}>
          <TooltipTrigger>
          <Button disabled={disabled} variant="ghost" onClick={() => handleOpenSideDrawer('remote_access')}>
          <ChevronUpDownIcon className='h-4 w-4 text-success' />
        </Button>
          <TooltipContent side="left">
            <div className="text-sm">
              <span className='text-justify'>{'Remote Access'}</span>
            </div>
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>}
      {!is_device_authorized && <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            disabled={disabled}
            variant='ghost'
            onClick={() => handleOpenSideDrawer('authorize_device')}
          >
            <MonitorCheck className='h-4 w-4 text-success' />
          </Button>
          <TooltipContent side='left'>
            <div className='text-sm'>
              <span className='text-justify'>Authorize Device</span>
            </div>
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>}
    </TooltipProvider>
  )
}

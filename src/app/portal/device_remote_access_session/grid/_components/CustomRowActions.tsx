'use client'
import { PlugZapIcon, UnplugIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export const CustomRowActions = ({ row }: { row: any }) => {
  const { original } = row
  const { id, device_id, remote_access_type, remote_access_status, remote_access_session } = original ?? {}
  const disconnectRemoteAccess = api.deviceRemoteAccessSession.disconnectDeviceRemoteAccess.useMutation()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const remote_access = ['ssh', 'tty']

  const handleOpenSideDrawer = async () => {
    const res = await createUpdate.mutateAsync({
      device_id: device_id || '',
      remote_access_type,
      category: remote_access_type
    })

    if (res.success) {
      if(remote_access?.includes(remote_access_type?.toLowerCase())) {
        // @ts-expect-error - No type yet
        const wsUrl = {
          ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
          tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/tty`,
        }[remote_access_type]
        const sessionKey = `terminal_session_${Date.now()}_${Math.random().toString(36)
          .substring(2, 9)}`
        localStorage.setItem(sessionKey, wsUrl)

        localStorage.setItem('current_terminal_session', sessionKey)
        localStorage.setItem('device_id', device_id)
        
        window.open(`/terminal`, '_blank')
      } else {
        window.open(`https://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/`, '_blank')
      }
    }
}

  const handleDisconnect = async () => {
    await disconnectRemoteAccess.mutateAsync({
      remote_access_session
    }).then(() => {
      toast.success('Disconnected successfully')
      window.location.reload()
    }
    )
      .catch((error) => {
        toast.error(error?.message || 'Error disconnecting')
      }
      )
  }

  const reconnect_status = ['timeout', 'disconnected', 'inactive', 'closed', 'terminated']

  const disabled = reconnect_status?.includes(remote_access_status?.toLowerCase())

  return (
    <div className="flex gap-2">
      <TooltipProvider >
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
            <Button disabled={disabled} variant="ghost" onClick={() => handleOpenSideDrawer()}>
            <PlugZapIcon className='h-4 w-4 text-success' />
          </Button>
            <TooltipContent side="left">
              <div className="text-sm">
                <span className='text-justify'>{'Reconnect'}</span>
              </div>
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
          
              <Button disabled={disabled} variant="ghost" onClick={() => handleDisconnect()}>
                <UnplugIcon className='h-4 w-4 text-danger' />
              </Button>
            <TooltipContent side="left">
              <div className="text-sm">
                <span className='text-justify'>{'Disconnect'}</span>
              </div>
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

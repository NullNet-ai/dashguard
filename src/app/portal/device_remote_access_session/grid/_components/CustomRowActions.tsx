'use client'
import { PlugZapIcon, UnplugIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export const CustomRowActions = ({ row }: { row: any }) => {
  const { original } = row
  const { id, device_id, tunnel_status, remote_access_session, tunnel_type } = original ?? {}
  const disconnectRemoteAccess = api.deviceRemoteAccessSession.disconnectDeviceRemoteAccess.useMutation()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const remote_access = ['ssh', 'tty']

  const handleOpenSideDrawer = async () => {
      if(remote_access?.includes(tunnel_type?.toLowerCase())) {
        // @ts-expect-error - No type yet
        const wsUrl = {
          ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
          tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/tty`,
        }[tunnel_type]
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

  const handleDisconnect = async () => {
    await disconnectRemoteAccess.mutateAsync({
      remote_access_session,
      tunnel_type,
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

  const disabled = ['terminated', 'expired'].includes(tunnel_status?.toLowerCase())
  
  return (
    <div className="flex gap-0">
      <TooltipProvider >
        {disabled ? (
          <Button disabled={disabled} variant="ghost" onClick={() => handleOpenSideDrawer()}>
            <PlugZapIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button disabled={disabled} variant="ghost" onClick={() => handleOpenSideDrawer()}>
                <PlugZapIcon className="h-4 w-4 text-success" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="text-sm">
                <span className="text-justify">{'Reconnect'}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {disabled ? (
          <Button disabled={disabled} variant="ghost" onClick={() => handleDisconnect()}>
            <UnplugIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button disabled={disabled} variant="ghost" onClick={() => handleDisconnect()}>
                <UnplugIcon className="h-4 w-4 text-danger" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="text-sm">
                <span className="text-justify">{'Disconnect'}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}

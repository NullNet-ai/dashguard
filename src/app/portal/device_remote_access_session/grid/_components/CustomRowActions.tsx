'use client'
import { PlugZapIcon, UnplugIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { openRemoteAccessSession } from '~/app/portal/device_remote_access_session/_utils/startRemoteAccessSession';

export const CustomRowActions = ({ row }: { row: any }) => {
  const { original } = row
  const { id, device_id, tunnel_status, remote_access_session, tunnel_type } = original ?? {}
  const disconnectRemoteAccess = api.deviceRemoteAccessSession.disconnectDeviceRemoteAccess.useMutation()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const remote_access = ['ssh', 'tty', 'rd']

  const handleOpenSideDrawer = async () => {
    openRemoteAccessSession(remote_access_session, tunnel_type, device_id);
  };

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

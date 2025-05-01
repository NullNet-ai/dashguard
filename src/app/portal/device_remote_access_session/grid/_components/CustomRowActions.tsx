'use client'
import { PlugZapIcon, UnplugIcon } from 'lucide-react'
import { toast } from 'sonner'

import BasicDetails from '~/app/portal/device_remote_access_session/_components/forms/basic-details/client'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'

export const CustomRowActions = ({ row }: { row: any }) => {
  const { original } = row
  const { id, device_id, remote_access_type, remote_access_status } = original ?? {}
  const { actions } = useSideDrawer()
  const disconnectRemoteAccess = api.deviceRemoteAccessSession.disconnectDeviceRemoteAccess.useMutation()

  const config = {
    header: original?.code,
    title: `ID: ${original?.code}`,
    sideDrawerWidth: '760px',
    body: {
      component: BasicDetails,
      componentProps: {
        record_data: original,
        entity: 'device_remote_access_session',
        actions,
        metadata: {},
      },
    },
    resizable: true,
    showResizeHandle: true,
    onCloseSideDrawer() {

    },
  }

  const handleOpenSideDrawer = async () => {
    actions.openSideDrawer(config as any)
  }

  const handleDisconnect = async () => {
    await disconnectRemoteAccess.mutateAsync({
      id,
      device_id,
      remote_access_type,
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

  const reconnect_status = ['active', 'idle']

  const disableReconnect = reconnect_status?.includes(remote_access_status?.toLowerCase())

  const disableDisconnect = !reconnect_status?.includes(remote_access_status?.toLowerCase())

  return (
    <div className="flex gap-2">
      <Button disabled={disableReconnect} variant="ghost" onClick={() => handleOpenSideDrawer()}>
        <PlugZapIcon className='h-4 w-4 text-success' />
      </Button>
      <Button disabled={disableDisconnect} variant="ghost" onClick={() => handleDisconnect()}>
        <UnplugIcon className='h-4 w-4 text-danger' />
      </Button>
    </div>
  )
}

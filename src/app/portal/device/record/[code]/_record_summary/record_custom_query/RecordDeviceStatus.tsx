'use client'
import { useMemo } from 'react'
import { isHeartbeatWithinSeconds } from '~/app/portal/device/utils/getHeartbeat'

import { Badge } from '~/components/ui/badge'

export default function GridDeviceStatus({
  lastHeartbeatBucket,
  onlineThresholdSeconds = 30,
}: {
  lastHeartbeatBucket?: string
  onlineThresholdSeconds?: number
}) {
  const status = useMemo(() => {
    if (!lastHeartbeatBucket) return null
    return isHeartbeatWithinSeconds(lastHeartbeatBucket, onlineThresholdSeconds)
      ? 'Online'
      : 'Offline'
  }, [lastHeartbeatBucket, onlineThresholdSeconds])

  if (!status) {
    return null
  }

  return <Badge variant={status == 'Online' ? 'success' : 'destructive'} className="flex items-center gap-x-1.5">
    <span className="size-[7px] rounded-full opacity-70" style={{ backgroundColor: status == 'Online' ? 'green' : 'red' }}></span>
    {status}
  </Badge>
}

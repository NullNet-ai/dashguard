'use client'
import React, { useMemo } from 'react'
import { getLastSecondsTimeStamp } from '~/app/portal/device/utils/getHeartbeat'

import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'



export default function GridDeviceStatus({ device_id }: { device_id: string }) {
  const {
    data: record = [{
      hour: '',
      heartbeats: null,
    }],

  } = api.deviceHeartbeats.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastSecondsTimeStamp(30),
  })

  const status = useMemo(() => record?.[0]?.heartbeats ? 'Online' : 'Offline', [
    record?.[0]?.heartbeats,
  ])

  if (record?.[0]?.heartbeats == null) {
    return null
  }

  return <Badge variant={status == 'Online' ? 'success' : 'destructive'}>{status}</Badge>
}

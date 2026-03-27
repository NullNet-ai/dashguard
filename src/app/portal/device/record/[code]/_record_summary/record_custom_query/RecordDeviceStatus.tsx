'use client'
import React, { useMemo } from 'react'
import { getLastSecondsTimeStamp } from '~/app/portal/device/utils/getHeartbeat'

import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


export default function GridDeviceStatus({ device_id }: { device_id: string }) {
  const {
    data: record = [{
      hour: '',
      heartbeats: null,
    }],

  } = api.deviceHeartbeat.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastSecondsTimeStamp(30),
    timezone
  })

  const heartbeats = record?.[0]?.heartbeats;

  const status = useMemo(() => heartbeats ? 'Online' : 'Offline', [heartbeats])

  if (record?.[0]?.heartbeats == null) {
    return null
  }

  return <Badge variant={status == 'Online' ? 'success' : 'destructive'} className="flex items-center gap-x-1.5">
    <span className="size-[7px] rounded-full opacity-70" style={{ backgroundColor: status == 'Online' ? 'green' : 'red' }}></span>
    {status}
  </Badge>
}

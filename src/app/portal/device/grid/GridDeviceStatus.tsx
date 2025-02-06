'use client'
import React, { useMemo } from 'react'

import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'
export const getLastThirtySecondsTimeStamp = () => {
  const now = new Date()

  const last_seconds = new Date(now)
  last_seconds.setSeconds(now.getSeconds() - 30)

  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formattedNow = replace(now)
  const formattedLast30 = replace(last_seconds)

  const result = [formattedLast30, formattedNow]

  return result
}
export default function GridDeviceStatus({ device_id }: { device_id: string }) {
  const {
    data: record = [{
      hour: '',
      heartbeats: null,
    }],

    
  } = api.deviceHeartbeats.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastThirtySecondsTimeStamp(),
  })


  const status = useMemo(() => record?.[0]?.heartbeats ? 'Online' : 'Offline', [
    record?.[0]?.heartbeats,
  ])

  if(record?.[0]?.heartbeats == null){
    return null
  }

  return <Badge variant={status == 'Online' ? 'success' : 'destructive'}>{status}</Badge>
}
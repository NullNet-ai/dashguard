'use client'
import React, { useMemo } from 'react'

import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'

import { getLastSecondsTimeStamp } from '../utils/getHeartbeat'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function GridDeviceStatus({ device_id }: { device_id: string }) {
  const {
    data: record = [{
      hour: '',
      heartbeats: null,
    }],

  } = api.deviceHeartbeat.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastSecondsTimeStamp(30),
    device_status: true,
    timezone,
  })

  const firstHeartbeat = record?.[0]?.heartbeats;

  const status = useMemo(() => firstHeartbeat ? 'Online' : 'Offline', [
    firstHeartbeat,
  ])

  if (record?.[0]?.heartbeats == null) {
    return null
  }

  return (
    <Badge variant='success'>
      { status }
    </Badge>
  )
}

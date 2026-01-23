'use client'

import moment from 'moment'
import { useMemo } from 'react'

import { api } from '~/trpc/react'

export default function GridDeviceLastHeartbeat({ device_id }: { device_id: string }) {
  const {
    data: record = { data: [{
      id: '',
      timestamp: '',
    }] },

  } = api.deviceHeartbeat.getLastHeartbeat.useQuery(
    {
      device_id,
    },
    {
      enabled: Boolean(device_id),
      refetchInterval: 1000,
    },
  )

  const recordData = record?.data;
  const timestamp = useMemo(() => {
    if (!recordData?.[0]?.timestamp) return
    return moment(recordData[0].timestamp).format('MM/DD/YYYY HH:mm')
  }, [recordData])

  return <span>{timestamp || 'None'}</span>
}

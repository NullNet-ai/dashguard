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

  } = api.deviceHeartbeats.getLastHeartbeat.useQuery({
    device_id,
  })

  const timestamp = useMemo(() => {
    if (!record?.data?.[0]?.timestamp) return
    return moment(record?.data?.[0]?.timestamp).format('MM/DD/YYYY HH:mm')
  }, [record?.data?.[0]?.timestamp])

  return <span>{timestamp}</span>
}

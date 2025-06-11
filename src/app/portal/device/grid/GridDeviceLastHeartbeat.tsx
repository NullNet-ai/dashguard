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

  } = api.deviceHeartbeat.getLastHeartbeat.useQuery({
    device_id,
  })

  const firstTimestamp = record?.data?.[0]?.timestamp;

  const timestamp = useMemo(() => {
    if (!firstTimestamp) return;
    return moment(firstTimestamp).format('MM/DD/YYYY HH:mm');
  }, [firstTimestamp])

  return <span>{timestamp}</span>
}

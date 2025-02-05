'use client'

import moment from 'moment'
import { useMemo } from 'react'

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

'use client'

import moment from 'moment'
import { useMemo } from 'react'

export default function GridDeviceLastHeartbeat({
  lastHeartbeatBucket,
}: {
  lastHeartbeatBucket?: string
}) {
  const timestamp = useMemo(() => {
    if (!lastHeartbeatBucket) return
    return moment(lastHeartbeatBucket).format('MM/DD/YYYY HH:mm')
  }, [lastHeartbeatBucket])

  return <span>{timestamp || 'None'}</span>
}

'use client'
import React from 'react'

import { Badge } from '~/components/ui/badge'

interface GridDeviceOnlineBadgeProps {
  online: boolean
}

export default function GridDeviceOnlineBadge({
  online,
}: GridDeviceOnlineBadgeProps) {
  return (
    <Badge variant={online ? 'success' : 'destructive'}>
      {online ? 'Online' : 'Offline'}
    </Badge>
  )
}

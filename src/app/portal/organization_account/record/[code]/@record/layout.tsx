'use client'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import RecordImplementationGuide from '../../../_components/record_guideline'
import ComingSoon from '../../_components/coming_soon'

import type { ILayoutProps } from './types'

const Layout = (props: ILayoutProps) => {
  const searchParams = useSearchParams()
  const slot = props[searchParams.get('current_tab') ?? 'dashboard']
  if (!slot) return (
    <div>
      <RecordImplementationGuide />
      <ComingSoon />
    </div>
  )
  return <div>{slot}</div>
}
export default Layout

'use client'

import React from 'react'

import { useRecord } from '../Provider'

import RecordSummaryContent from './SummaryContent'

const RecordClientWrapper = ({ image_placeholder, header_center_slot, children }: any) => {
  const { state } = useRecord() || {}

  if (state?.config?.showRecordSummary ?? true) {
    return (
      <div>
        <RecordSummaryContent
          image_placeholder={image_placeholder}
          header_center_slot={header_center_slot}
        >
          {children}
        </RecordSummaryContent>
      </div>
    )
  }

  return null
}

export default RecordClientWrapper

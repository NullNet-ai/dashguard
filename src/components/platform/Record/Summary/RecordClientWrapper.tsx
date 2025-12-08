'use client'

import React from 'react'

import { useRecord } from '../Provider'

import RecordSummaryContent from './SummaryContent'

const RecordClientWrapper = ({ image_placeholder, children }: any) => {
  const { state } = useRecord() || {}

  if (state?.config?.showRecordSummary ?? true) {
    return (
      <div>
        <RecordSummaryContent image_placeholder={image_placeholder}>
          {children}
        </RecordSummaryContent>
      </div>
    )
  }

  return null
}

export default RecordClientWrapper

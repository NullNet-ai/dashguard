'use client'
import React from 'react'
const Summary = () => {
  return <div />
}

const ConfirmationSummary = {
  label: 'Confirmation',
  required: false,
  components: [
    {
      label: 'Confirmation',
      component: <Summary />,
    },
  ],
}

export default ConfirmationSummary

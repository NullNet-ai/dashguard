'use client'
import React from 'react'
const Summary = () => {
  return <div />
}

const ConfirmationSummary = {
  label: 'Step 3',
  required: false,
  components: [
    {
      label: 'Confirmation',
      component: <Summary />,
    },
  ],
}

export default ConfirmationSummary

'use client';
import React from 'react';
const Summary = () => {
  return <div />;
};

const ConfirmationSummary = {
  label: 'Step 2',
  required: false,
  components: [
    {
      label: 'Confirmation',
      component: <Summary />,
    },
  ],
};

export default ConfirmationSummary;

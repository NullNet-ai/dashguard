'use client';

import React from 'react';

import { useRecord } from '../Provider';

import RecordSummaryContent from './SummaryContent';

const RecordClientWrapper = ({
  image_placeholder,
  header_center_slot,
  is_show_header_tab,
  actions,
  children,
  main_entity,
}: any) => {
  const { state } = useRecord() || {};

  if (state?.config?.showRecordSummary ?? true) {
    return (
      <div>
        <RecordSummaryContent
          image_placeholder={image_placeholder}
          header_center_slot={header_center_slot}
          is_show_header_tab={is_show_header_tab}
          actions={actions}
          main_entity={main_entity}
        >
          {children}
        </RecordSummaryContent>
      </div>
    );
  }

  return null;
};

export default RecordClientWrapper;

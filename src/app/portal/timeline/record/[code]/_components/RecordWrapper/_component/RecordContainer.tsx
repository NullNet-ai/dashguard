'use client';

import { useContext } from 'react';
import { useRecord } from '~/components/platform/Record/Provider';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { cn } from '~/lib/utils';

const RecordContainer = ({ children }: any) => {
  const { isCollapseRecordSummary } =
    useContext(RecordWrapperContext);

   const {state: recordState} = useRecord() ?? {};
    
    if (recordState?.config?.showRecordSummary === false) {
      return null;
    }

  return (
    <div className={cn(`hidden h-full min-h-[calc(100dvh-100px)] w-full md:block`,
        `${!isCollapseRecordSummary ? 'w-full min-w-[300px] max-w-min' : 'w-12'}`
    )}>
      {children}
    </div>
  );
};

export default RecordContainer;
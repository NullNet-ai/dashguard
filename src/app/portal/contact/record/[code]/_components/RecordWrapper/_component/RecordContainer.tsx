'use client';

import { useContext } from 'react';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { cn } from '~/lib/utils';

const RecordContainer = ({ children }: any) => {
  const { isCollapseRecordSummary } =
    useContext(RecordWrapperContext);

  return (
    <div className={cn(`hidden h-full min-h-[calc(100vh-84px)] w-full border-r border-slate-100 md:block`,
        `${!isCollapseRecordSummary ? 'w-full min-w-[300px] max-w-min' : 'w-12'}`
    )}>
      {children}
    </div>
  );
};

export default RecordContainer;
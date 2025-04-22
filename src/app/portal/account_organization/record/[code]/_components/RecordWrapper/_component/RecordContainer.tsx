'use client';

import { useContext } from 'react';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { cn } from '~/lib/utils';

const RecordContainer = ({ children }: any) => {
  const { isCollapseRecordSummary } =
    useContext(RecordWrapperContext);

  return (
    <div className={cn(`hidden h-full min-h-[calc(100vh-84px)] w-full border-r border-slate-100 md:block`,
        `${!isCollapseRecordSummary ? 'md:w-[240px] lg:w-[300px]' : 'w-12'}`
    )}>
      {children}
    </div>
  );
};

export default RecordContainer;

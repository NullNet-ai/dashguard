'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { api } from '~/trpc/react';
import SummaryClientContent from './SummaryClientContent';
import { useEventEmitter } from '~/context/EventEmitterProvider';

const RecordSummaryContent = ({ children, image_placeholder }: any) => {
  const eventEmitter = useEventEmitter();
  const pathname = usePathname();
  const token = (getCookie('token') as string) || '';

  const [, , mainEntity, , identifier] = pathname.split('/');

  if (!identifier || !mainEntity || !token) {
    throw new Error('Invalid URL parameters');
  }
  // Query for record details
  const {
    data: recordDetails,
    isLoading: recordLoading,
    error: recordError,
    refetch: recordRefetch,
  } = api.record.getByCodeWithJoin.useQuery(
    {
      id: identifier!,
      pluck_fields: [
        'id',
        'code',
        'status',
        'created_date',
        'created_time',
        'updated_date',
        'updated_time',
        'categories',
        'updated_by',
        'image_url',
      ],
      main_entity: mainEntity!,
    },
    {
      enabled: !!identifier && !!mainEntity,
      retry: 1,
    },
  );

  useEffect(() => {
      eventEmitter.on('record:summary_content', () => {
        recordRefetch();
      });
    return () => {
      eventEmitter.off('record:summary_content', recordRefetch);
    };
  }, []);

  // Handle loading state
  // if (recordLoading) {
  //   return (
  //     <div className="flex h-full w-full items-center justify-center">
  //       <div className="text-sm text-gray-500">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <SummaryClientContent
      recordDetails={recordDetails}
      mainEntity={mainEntity}
      token={token}
      image_placeholder={image_placeholder}
    >
      {children}
    </SummaryClientContent>
  );
};

export default RecordSummaryContent;

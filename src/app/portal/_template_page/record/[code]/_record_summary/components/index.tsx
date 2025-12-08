'use client';
import React from 'react';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import StatusCell from '~/components/ui/status-cell';
import { api } from '~/trpc/react';
import ContentLoading from './loader';

import useRefetchRecord from '../hooks/useFetchMainRecord';

const fields = {
  Category: 'categories',
};

const RecordShellSummary = ({
  form_key,
  identifier,
  main_entity,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
    isLoading,
    isError,
  } = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'categories'],
  });

  const data = record ?? {};

  useRefetchRecord({
    refetch: refetch,
    form_key,
  });

  if (isLoading) {
    return <ContentLoading />;
  }

  if (isError) {
    return (
      <Alert variant="error" dismissible>
        <AlertTitle>Error</AlertTitle>
        <AlertContent>{JSON.stringify(error)}</AlertContent>
      </Alert>
    );
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value], index) => {
        const dataValue = (data as { [key: string]: any })?.[value];
        return (
          <div className="pt-2" key={index}>
            <div className="px-5">
              <div className="p-1 text-sm">
                <div>
                  <span className="text-slate-400">{key}: </span>
                  <span>
                    {key === 'Category'
                      ? (dataValue?.length &&
                          dataValue.map((item: string) => {
                            return <StatusCell key={item} value={item} />;
                          })) ||
                        'None'
                      : dataValue || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecordShellSummary;

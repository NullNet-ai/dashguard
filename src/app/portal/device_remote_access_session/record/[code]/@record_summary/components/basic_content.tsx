'use client';
import { api } from '~/trpc/react';
import ContentLoading from './loader';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import useRefetchRecord from '../hooks/useFetchMainRecord';

const fields = {
  ID: 'code',
};

export default function BasicRecordContent({
  form_key,
  identifier,
  main_entity,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
    isLoading,
    isError,
  } = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'code'],
  });

  useRefetchRecord({
    refetch,
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
      {Object.entries(fields).map(([key, value], index) => (
        <div className="pt-2" key={index}>
          <div className="px-5">
            <div className="p-1 text-sm">
              <div>
                <span className="text-slate-400">{key}: </span>
                <span>
                  {(record?.data as { [key: string]: any })?.[value] || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

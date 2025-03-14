'use client';
import { api } from '~/trpc/react';
import ContentLoading from './loader';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';

const fields = {
  Name: 'name',
  Event: 'event',
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
    pluck_fields: ['id', 'categories', 'name', 'event'],
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
      <div className="p-1 px-5 text-sm">
        <div>
          <span className="text-slate-400">Category:</span>
          <div className="inline-flex gap-2 p-1">
            <Badge className="" variant={'primary'}>
              {record?.data?.categories?.[0]}
            </Badge>
          </div>
        </div>
      </div>
      <Separator />
      {Object.entries(fields).map(([key, value], index) => (
        <div className="px-6 pt-2 text-sm" key={index}>
          <div>
            <span className="text-slate-400">{key}: </span>
            <span>
              {(record?.data as { [key: string]: any })?.[value] || 'None'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

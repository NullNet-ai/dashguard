'use client';
import { api } from '~/trpc/react';
import ContentLoading from './loader';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { Separator } from '~/components/ui/separator';
import { CardComponent as Card } from '~/components/ui/card/index';

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
    <Card className='p-3'>
      <div className="flex flex-col gap-y-2">
        <div>
          <span className="text-md font-medium text-foreground">
            Communication Template Details
          </span>
        </div>
        <Separator />
        <div className="flex flex-col gap-1 px-1">
          {Object.entries(fields).map(([key, value], index) => (
            <div className="flex justify-between gap-2 text-sm" key={index}>
              <span className="text-slate-400 whitespace-nowrap">{key} </span>
              <span className='break-all text-slate-700'>
                {(record?.data as { [key: string]: any })?.[value] || 'None'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

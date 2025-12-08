import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import BasicDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');
  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'subject', 'content', 'categories'],
  });

  const defaultValues = Object.fromEntries(
    Object.entries(record?.data || {})
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => {
        if (
          key === 'content' &&
          record?.data?.categories?.[0] === 'SMS' &&
          typeof value === 'string'
        ) {
          return [key, value.toString().replace(/<[^>]*>/g, '')];
        }
        return [key, value];
      }),
  );

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: record?.data?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;

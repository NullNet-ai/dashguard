import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import CategoryDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');
  const organizationRecord = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'code', 'categories'],
  });

  const categories = organizationRecord?.data?.categories?.[0];
  const default_values = {
    categories: categories || '',
  };


  return (
    <div className="space-y-2">
      <CategoryDetails
        defaultValues={default_values}
        params={{
          id: organizationRecord?.data?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;

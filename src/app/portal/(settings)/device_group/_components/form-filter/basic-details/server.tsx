import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import BasicDetails from './client';

const BasicDetailsFilterServer = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const pluck_fields = ['id', 'code', 'name', 'status'];
  const [, , , application, identifier] = pathname.split('/');

  const record_data = await api.record.getByCode({
    main_entity: 'device_group_settings',
    id: identifier!,
    pluck_fields,
  });

  const default_values = record_data?.data;
  const device_group_id = default_values?.id;

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={{
          ...default_values,
        }}
        params={{
          id: device_group_id!,
          shell_type: application! as 'record' | 'wizard',
          entity: 'device_group_settings',
          pluck_fields,
        }}
        selectedRecords={device_group_id ? [default_values] : []}
      />
    </div>
  );
};

export default BasicDetailsFilterServer;

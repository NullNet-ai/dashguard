import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import DeviceGroupBasicDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');
  const fetched_device_group = await api.deviceGroup.getByCode({
    code: identifier!,
    pluck_fields: ['id', 'code', 'name'],
  });
  const defaultValues = fetched_device_group?.data;
  return (
    <div className="space-y-2">
      <DeviceGroupBasicDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;

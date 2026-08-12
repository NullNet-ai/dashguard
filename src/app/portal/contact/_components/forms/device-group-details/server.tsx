import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import DeviceGroupDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');

  const [contact, device_groups] = await Promise.all([
    api.record.getByCode({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ['id'],
    }),
    api.grid.items({
      entity: 'device_group_setting',
      pluck: ['id', 'name'],
      limit: 100,
    }),
  ]);

  const deviceGroupOptions = device_groups.items?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const fetch_def_val = await api.contactDevice.currentGroups({
    contact_id: contact?.data?.id!,
  });
  
  const default_values = fetch_def_val?.length
    ? { device_groups: fetch_def_val }
    : {};

  return (
    <div className="space-y-2">
      <DeviceGroupDetails
        defaultValues={default_values}
        multiSelectOptions={{ device_groups: deviceGroupOptions }}
        params={{
          id: contact?.data?.id!,
          shell_type: application! as 'record' | 'wizard',
        }}
      />
    </div>
  );
};

export default FormServerFetch;

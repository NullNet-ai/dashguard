import { headers } from 'next/headers';

import { api } from '~/trpc/server';
import DeviceGroupDevicesGrid from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  const record_details = await api.deviceGroup.getByCode({
    code: identifier!,
    pluck_fields: ['id'],
  });

  const device_group_setting_id = record_details?.data?.id as string | undefined;

  if (!device_group_setting_id) return null;

  return (
    <div className="space-y-2">
      <DeviceGroupDevicesGrid
        device_group_setting_id={device_group_setting_id}
      />
    </div>
  );
};

export default FormServerFetch;

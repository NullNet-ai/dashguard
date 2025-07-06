import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import DeviceCategory from './client';

const optionsByCategory: Record<string, string[]> = {
  Firewall: ['PFSense', 'OPNSense'],
  'AppGuard Client': [
    'ExpressJS',
    'NextJS',
    'Nginx',
    'Actix',
    'Axum',
    'Rocket',
    'SMTP',
  ],
  'Load Balancer': [],
};

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');

  const fetched_device = await api.device.fetchDeviceInfo({
    code: identifier!,
  });

  const options = optionsByCategory[fetched_device!.device_category]?.map(
    (value) => ({ label: value, value }),
  );

  return (
    <div className="space-y-2">
      <DeviceCategory
        defaultValues={{ ...fetched_device }}
        params={{
          id: fetched_device?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
        selectOptions={{
          device_type: options,
        }}
      />
    </div>
  );
};

export default FormServerFetch;

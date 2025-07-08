'use client';

import { api } from '~/trpc/react';
import { usePathname } from 'next/navigation';
import useRefetchRecord from '../hooks/useFetchMainRecord';

const fields = {
  'Device Name': 'device_name',
  'Device Type': 'device_type',
};

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , , identifier] = pathName.split('/');
  
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.device.fetchDeviceInfo.useQuery({
    code: identifier!,
  });

  const { data } = record ?? {};

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return (
      <div>
        {'Error:'}
        {error.message}
      </div>
    );
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value]) => (
        <p key={key} className="mb-[8px]">
          <strong> {key}: </strong>
          &nbsp; {(data as { [key: string]: any })?.[value] || 'None'}
        </p>
      ))}
    </div>
  );
};

const DeviceTypeDetailsSummary = {
  label: 'Step 2',
  required: false,
  show_summary: true,
  components: [
    {
      label: 'Device Type',
      component: <Summary form_key={'deviceType'} />,
    },
  ],
};

export default DeviceTypeDetailsSummary;

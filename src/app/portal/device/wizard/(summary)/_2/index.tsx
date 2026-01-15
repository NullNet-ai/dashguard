"use client";

import { usePathname } from 'next/navigation';
import { api } from '~/trpc/react';

const Summary = () => {

  const pathName = usePathname();
    const [, , , _, identifier] = pathName.split('/');

  const {
      data: record,
      refetch,
      error,
    } = api.device.fetchDeviceInfo.useQuery({
      code: identifier!
    });
  
  return (
    <div>
      <p className="mb-[8px] no-underline text-[#334155]">
        <strong>Device Name: </strong>
        {/* @ts-expect-error - No type yet */}
        &nbsp; {record?.device_name || 'None'}
      </p>
      <p className="mb-[8px] no-underline text-[#334155]">
        <strong>Device Type: </strong>
        {/* @ts-expect-error - No type yet */}
        &nbsp; {record?.device_type || 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: "Step 2",
  required: false,
  show_summary: true,
  components: [
    {
      label: "Device Type",
      component: <Summary />,
    },
  ],
};

export default SummaryConfig;

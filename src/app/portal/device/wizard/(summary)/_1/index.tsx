'use client';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { api } from '~/trpc/react';
import useRefetchRecord from '../hooks/useFetchMainRecord';

const SetupSummary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , _, identifier] = pathName.split('/');
  const {
    data: record,
    refetch,
    error,
  } = api.device.getAccountSetUpDetailsByDeviceCode.useQuery({
    device_code: identifier!
  });

  const deviceData = record?.data?.[0];

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p className="mb-[8px] no-underline text-[#334155]">
        <strong>Category: </strong>
        &nbsp; {deviceData?.devices?.device_category || 'None'}
      </p>
    </div>
  );
};

const DeviceLocationSummary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , _, identifier] = pathName.split('/');
  const {
    data: record,
    refetch,
    error,
  } = api.device.getAccountSetUpDetailsByDeviceCode.useQuery({
    device_code: identifier!,
  });

  const deviceData = record?.data?.[0];
  const locationLabel = useMemo(() => {
    const address = Array.isArray(deviceData?.addresses)
      ? deviceData?.addresses?.[0]
      : deviceData?.addresses;
    const city = address?.city;
    const country = address?.country;

    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return 'None';
  }, [deviceData?.addresses]);

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p className="mb-[8px] no-underline text-[#334155]">
        <strong>Location: </strong>
        &nbsp; {locationLabel}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Device Category',
      component: <SetupSummary form_key={'deviceCategoryForm'} />,
    },
    {
      label: 'Device Location',
      component: <DeviceLocationSummary form_key={'deviceLocationForm'} />,
    },
  ],
};

export default SummaryConfig;

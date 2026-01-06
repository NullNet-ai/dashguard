'use client';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { api } from '~/trpc/react';
import useRefetchRecord from '../hooks/useFetchMainRecord';

const Summary = ({ form_key }: { form_key: string }) => {
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
  const accountOrg = deviceData?.account_organizations;

  const memoizedAppId = useMemo(() => {
    if (accountOrg?.email) {
      return accountOrg?.email;
    }
    return 'None';
  }, [accountOrg?.email]);

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
        {/* @ts-expect-error - No type yet */}
        &nbsp; {deviceData?.devices?.device_category || 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Setup',
      component: <Summary form_key={'basicDetails'} />,
    },
  ],
};

export default SummaryConfig;

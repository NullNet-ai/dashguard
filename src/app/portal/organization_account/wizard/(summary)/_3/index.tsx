'use client';
import { usePathname } from 'next/navigation';

import { api } from '~/trpc/react';

import useRefetchRecord from '../hooks/useFetchMainRecord';

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , _, identifier, current_step] = pathName.split('/');
  const {
    data: record,
    refetch,
    error,
  } = api.account.fetchExternalInternalUserDetails.useQuery({
    code: identifier!,
  });

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
  if(record?.categories?.[0] !== 'Internal User' && current_step === '3') return null;
  
  return (
    <div>
      <p className="mb-[8px] no-underline">
        <strong> Username: </strong>
        &nbsp;
        {record?.account_id || 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> Role: </strong>
        &nbsp;
        {record?.role || 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 3',
  required: true,
  components: [
    {
      label: 'Account Details',
      component: <Summary form_key="AccountDetails" />,
    },
  ],
};

export default SummaryConfig;

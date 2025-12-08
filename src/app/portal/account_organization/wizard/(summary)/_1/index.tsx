'use client';
import { usePathname } from 'next/navigation';

import { api } from '~/trpc/react';

import useRefetchRecord from '../hooks/useFetchMainRecord';
const fields = {
  email: 'Email',
  role: 'Role',
};

interface IAccountDetails {
  id?: string;
  email: string;
  role: string;
}
const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , , identifier] = pathName.split('/');
  const {
    data = {},
    refetch,
    error,
  } = api.account.fetchWizardSummary.useQuery({
    contact_code: '',
    account_organization_code: identifier!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="mt-2">
      {Object.entries(fields).map(([key, value]) => (
        <p key={key} className="mb-[8px] no-underline text-[#334155]">
          <strong> {value}: </strong>
          &nbsp; {data?.[key as keyof IAccountDetails] || 'None'}
        </p>
      ))}
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Account Details',
      component: <Summary form_key="account_details" />,
    },
  ],
};

export default SummaryConfig;

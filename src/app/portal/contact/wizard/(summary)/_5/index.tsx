'use client';
import { api } from '~/trpc/react';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { usePathname } from 'next/navigation';

const fields = {
  email: 'Email',
  role: 'Role',
};

interface IAccountDetails {
  id?: string;
  email: string;
  role: string;
  account_id: string;
}
const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , , identifier] = pathName.split('/');
  const {
    data = [],
    refetch,
    error,
  } = api.account.fetchWizardSummary.useQuery({
    contact_code: identifier!,
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
          <span className='text-slate-400'> {value}: </span>
          &nbsp; {data?.[key as keyof IAccountDetails] || 'None'}
        </p>
      ))}
    </div>
  );
};
const SummaryConfig = {
  label: 'Step 5',
  required: false,
  show_summary: true,
  components: [
    {
      label: 'Account Details',
      component: <Summary form_key="account_details" />,
    },
  ],
};

export default SummaryConfig;

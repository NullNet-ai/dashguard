'use client';
import { usePathname, useSearchParams } from 'next/navigation';

import { api } from '~/trpc/react';

import useRefetchRecord from '../hooks/useFetchMainRecord';
import useCategory from '~/hooks/useCategory';

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const category = useCategory();
  const [, , entity, _, identifier] = pathName.split('/');
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
  if(category == 'External User') {
    return (
      <div>
        <p className="mb-[8px] no-underline">
          <strong> Role: </strong>
          &nbsp;
          {record?.role || 'None'}
        </p>
        <p className="mb-[8px] no-underline">
          <strong> Email: </strong>
          &nbsp;
          {record?.email || 'None'}
        </p>
      </div>
    )
  }
  return (
    <div>
      <p className="mb-[8px] no-underline">
        <strong> Primary Phone Number: </strong>
        &nbsp;
        {record?.contact?.phone || 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> Primary Email: </strong>
        &nbsp;
        {record?.contact?.email || 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> First Name: </strong>
        &nbsp;
        {record?.contact?.first_name || 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> Last Name: </strong>
        &nbsp;
        {record?.data?.last_name || 'None'}
      </p>
    </div>
  );
};

// const SummaryConfig = () => {
//   const category = useCategory();
//   return ({
//     label: category === 'External User' ? 'Invite External User' : 'Selelct Internal User',
//     required: true,
//     components: [
//       {
//         label: category === 'External User' ? 'External User Details' : 'User Details',
//         component: <Summary form_key="BasicDetails" />,
//       },
//     ],
//   })
// };

const SummaryConfig = {
  label: 'Step 2',
  required: true,
  components: [
    {
      label: 'User Details',
      component: <Summary form_key="UserDetails" />,
    },
  ],
};

export default SummaryConfig;
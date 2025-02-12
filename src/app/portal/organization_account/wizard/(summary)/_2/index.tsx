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
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ['id', 'code', 'status'],
    main_entity: entity!,
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
          {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
        </p>
        <p className="mb-[8px] no-underline">
          <strong> Email: </strong>
          &nbsp;
          {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
        </p>
      </div>
    )
  }
  return (
    <div>
      <p className="mb-[8px] no-underline">
        <strong> Primary Phone Number: </strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> Primary Email: </strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> First Name: </strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
      </p>
      <p className="mb-[8px] no-underline">
        <strong> Last Name: </strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
      </p>
    </div>
  );
};

// const getSummaryConfig = (category: string | null) => ({
//   label: category === 'External User' ? 'Invite External User' : 'Selelct Internal User',
//   required: true,
//   components: [
//     {
//       label: category === 'External User' ? 'External User Details' : 'User Details',
//       component: <Summary form_key="BasicDetails" />,
//     },
//   ],
// });

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
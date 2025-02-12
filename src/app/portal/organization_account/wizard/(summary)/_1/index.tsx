'use client';
import { usePathname } from 'next/navigation';

import { api } from '~/trpc/react';

import useRefetchRecord from '../hooks/useFetchMainRecord';

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, _, identifier] = pathName.split('/');
  const {
    data: record = { data: { } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ['id', 'categories'],
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
  return (
    <div>
      <p className="mb-[8px] no-underline">
        <strong> Category: </strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0] : 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Category Details',
      component: <Summary form_key="CategoryDetails" />,
    },
  ],
};

export default SummaryConfig;

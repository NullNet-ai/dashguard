'use client';
import { usePathname } from 'next/navigation';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { api } from '~/trpc/react';

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, , identifier] = pathName.split('/');
  const {
    data: record = { data: { id: null } },
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
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <p className="mb-[8px] no-underline text-[#334155]">
        <strong>{' Category: '}</strong>
        &nbsp;
        {record?.data?.categories?.[0] ? record?.data?.categories?.[0]  : 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 3',
  required: true,
  components: [
    {
      label: 'Category Details',
      component: <Summary form_key="CategoryDetails" />,
    },
  ],
};

export default SummaryConfig;

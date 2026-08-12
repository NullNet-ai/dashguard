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
    pluck_fields: ['id', 'code', 'status'],
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
        {/* <strong>{' Category: '}</strong>
        &nbsp; */}
        {/* {record?.data?.categories?.[0] ? record?.data?.categories?.[0]  : 'None'} */}
        You can review and adjust the content.
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 4',
  required: true,
  components: [
    {
      label: 'Content',
      component: <Summary form_key="ContentDetails" />,
    },
  ],
};

export default SummaryConfig;

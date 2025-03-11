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
    pluck_fields: ['id', 'code', 'name'],
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
      <p className="mb-[8px] no-underline">
        <strong>{' Name: '}</strong>
        &nbsp;
        {record?.data?.name ? record?.data?.name : 'None'}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Basic Details',
      component: <Summary form_key={'BasicDetails'} />,
    },
  ],
};

export default SummaryConfig;

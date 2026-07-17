'use client';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { api } from '~/trpc/react';
import { usePathname } from 'next/navigation';

const fields = {
  'Device Group': 'name',
};

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();

  const [, , , _, identifier] = pathName.split('/');

  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    main_entity: 'device_group_settings',
    id: identifier!,
    pluck_fields: ['id', 'name'],
  });

  const { data } = record || {};

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value]) => (
        <p key={key} className="mb-[8px] text-[#334155] no-underline">
          <strong> {key}: </strong>
          &nbsp; {data?.[value] || 'None'}
        </p>
      ))}
    </div>
  );
};

const StepOneBasicDetails = {
  label: 'Step 1',
  required: true,
  components: [
    {
      label: 'Record Details',
      component: <Summary form_key={'UserRolesBasicDetails'} />,
    },
  ],
};

export default StepOneBasicDetails;

'use client';
import { usePathname } from 'next/navigation';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { api } from '~/trpc/react';

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, _, identifier] = pathName.split('/');
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.location.getLocationAddress.useQuery({
    id: identifier!,
    main_entity: entity!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return (
      <div>
        <h3 className="mb-2 font-medium text-red-800">Error Loading Data</h3>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const address = Array.isArray(record.data) ? record.data[0]?.addresses : undefined;

  return (
    <div>
      {!address ? (
        <p className="italic text-gray-500">No address information available</p>
      ) : (
        <div className="space-y-3">
          <div className="flex">
            <div className="w-full">
              <p className="text-sm text-gray-600">Street Address</p>
              <p className="font-medium">{address.address_line_one}</p>
              {address.address_line_two && (
                <p className="font-medium">{address.address_line_two}</p>
              )}
            </div>
          </div>
          <div className="flex">
            <div className="w-full">
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium">{address.city}</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-full">
              <p className="text-sm text-gray-600">State/Region</p>
              <p className="font-medium">{address.state || address.region}</p>
            </div>
          </div>
          <div className="flex">
            <div className="w-full">
              <p className="text-sm text-gray-600">Postal Code</p>
              <p className="font-medium">{address.postal_code}</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-1/2">
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{address.country}</p>
            </div>
          </div>

          {address.latitude && address.longitude && (
            <div>
              <p className="text-sm text-gray-600">Coordinates</p>
              <p className="font-medium">
                {address.latitude}, {address.longitude}
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-600">Full Address</p>
            <p className="font-medium">{address.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryConfig = {
  label: 'Step 3',
  required: true,
  components: [
    {
      label: 'Location Address',
      component: <Summary form_key={'LocationAddress'} />,
    },
  ],
};

export default SummaryConfig;

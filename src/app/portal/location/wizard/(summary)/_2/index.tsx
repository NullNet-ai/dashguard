"use client";
import { usePathname } from "next/navigation";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, _, identifier] = pathName.split("/");
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ["id", "code", "status", "location_name"],
    main_entity: entity!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return (
      <div>
        <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <span className="font-medium mr-2">Location Name:</span>
          <span>{record?.data?.location_name || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );
};

const SummaryConfig = {
  label: "Step 2",
  required: true,
  components: [
    {
      label: "Location Details",
      component: <Summary form_key={"locationdetails"} />,
    },
  ],
};

export default SummaryConfig;

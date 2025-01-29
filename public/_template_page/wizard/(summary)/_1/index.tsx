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
    pluck_fields: ["id", "code", "status"],
    main_entity: entity!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  // TODO: Implement Summary component UI manually
  return <pre>{JSON.stringify(record, null, 2)}</pre>;
};

const SummaryConfig = {
  label: "Step 1",
  required: true,
  components: [
    {
      label: "Record Details",
      component: <Summary form_key={"BasicDetails"} />,
    },
  ],
};

export default SummaryConfig;

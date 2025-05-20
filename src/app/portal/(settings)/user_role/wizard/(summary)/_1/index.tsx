"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";
import { usePathname } from "next/navigation";

const fields = {
  Role: "role",
};

const Summary = ({
  form_key,

}: {
  form_key: string;

}) => {
  const pathName = usePathname();

  const [, , entity, _, identifier] = pathName.split("/");

  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    main_entity: entity!,
    id: identifier!,
    pluck_fields: ["id", "role"],
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
        <p key={key} className="mb-[8px] no-underline">
          <strong> {key}: </strong>
          &nbsp; {data?.[value] || "None"}
        </p>
      ))}
    </div>
  );
};

const StepOneBasicDetails = {
  label: "Step 1",
  required: true,
  components: [
    {
      label: "Record Details",
      component: <Summary form_key={"UserRolesBasicDetails"} />,
    },
  ],
};

export default StepOneBasicDetails;

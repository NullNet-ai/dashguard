"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";
import { usePathname } from "next/navigation";

const fields = {
  "Parent Organization": "parent_organization",
  Name: "name",
};

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , _, identifier] = pathName.split("/");
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.organization.getOrgSummary.useQuery({
    code: identifier!,
    pluck_fields: ["id", "name", "parent_organization_id"],
  });

  const { data } = record ?? {};

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
          &nbsp; {(data as { [key: string]: any })?.[value] || "None"}
        </p>
      ))}
    </div>
  );
};

const SummaryConfig = {
  label: "Step 1",
  required: false,
  components: [
    {
      label: "Organization Details",
      component: <Summary form_key={"organization_basic_details"} />,
    },
  ],
};

export default SummaryConfig;

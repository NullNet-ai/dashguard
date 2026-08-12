"use client";
import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { usePathname } from "next/navigation";

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, _, identifier] = pathName.split("/");
  const {
    data: record = {
      data: {
        organizations: [],
        user_roles: [],
      },
    },
    refetch,
    error,
  } = api.organizationContact.fetchOrganizations.useQuery({
    code: identifier!,
  });

  const { organizations } = record?.data || {};

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <p>
        <span className='text-slate-400'> Department: </span>
        &nbsp;{" "}
        {organizations?.length
          ? organizations
              ?.map(({ label }: { label: string }) => label)
              .join(", ")
          : "None"}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: "Step 4",
  required: false,
  show_summary: true,
  components: [
    {
      label: "Department Details",
      component: <Summary form_key={"organization_details"} />,
    },
  ],
};

export default SummaryConfig;

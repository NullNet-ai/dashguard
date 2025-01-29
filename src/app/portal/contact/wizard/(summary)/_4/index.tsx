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

  const { organizations, user_roles } = record?.data || {};

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
        <strong> Organization: </strong>
        &nbsp;{" "}
        {organizations?.length
          ? organizations
              ?.map(({ label }: { label: string }) => label)
              .join(", ")
          : "None"}
      </p>
      <p>
        <strong> Role: </strong>
        &nbsp;{" "}
        {user_roles?.length
          ? user_roles?.map(({ label }: { label: string }) => label).join(", ")
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
      label: "Organization",
      component: <Summary form_key={"organization_details"} />,
    },
  ],
};

export default SummaryConfig;

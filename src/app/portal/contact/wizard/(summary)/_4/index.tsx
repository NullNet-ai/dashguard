"use client";
import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";

const ContactOrganizationSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
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

export default ContactOrganizationSummary;

"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { Key } from "react";

const fields = {
  organization: "Organization",
  role: "Role",
  account_id: "Username",
  account_secret: "Password",
};

interface IAccountDetails {
  id: string;
  organization_id: string;
  role_id: string;
  account_id: string;
  account_secret: string;
}
const AccountDetailsSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const { data, refetch, error } = api.account.fetchAccountDetails.useQuery({
    contact_code: identifier!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      {data?.accounts?.map((account: IAccountDetails, index: number) => (
        <div key={index}>
          <span>{`Account ${index + 1}`}</span>
          {Object.entries(fields).map(([key, value]) => (
            <p key={key} className="mb-[8px] no-underline">
              <strong> {value}: </strong>
              &nbsp; {account?.[key as keyof IAccountDetails] || "None"}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AccountDetailsSummary;

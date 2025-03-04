"use client";
import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { usePathname } from "next/navigation";
import { Separator } from "~/components/ui/separator";

const fields = {
  account_id: "Email",
  role: "Role",
};

interface IAccountDetails {
  id?: string;
  organization: string;
  role: string;
  account_id: string;
}
const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , , identifier] = pathName.split("/");
  const {
    data = [],
    refetch,
    error,
  } = api.account.fetchWizardSummary.useQuery({
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
      {(data as IAccountDetails[])?.map(
        (account: IAccountDetails, index: number) =>
          account?.id && (
            <div key={account.id} className="mt-2">
              {Object.entries(fields).map(([key, value]) => (
                <p key={key} className="mb-[8px] no-underline">
                  <strong> {value}: </strong>
                  &nbsp; {account?.[key as keyof IAccountDetails] || "None"}
                </p>
              ))}
              {index !== data?.length - 1 && <Separator />}
            </div>
          ),
      )}
    </div>
  );
};
const SummaryConfig = {
  label: "Step 5",
  required: false,
  show_summary: true,
  components: [
    {
      label: "Account Details",
      component: <Summary form_key="account_details" />,
    },
  ],
};

export default SummaryConfig;

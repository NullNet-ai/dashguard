"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";
import { usePathname } from "next/navigation";

const fields = {
  "Server URL": "server_url",
};

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();

  const [, , , , identifier] = pathName.split("/");
  const {
    // data: record = { data: { id: null } },
    data: record,
    refetch,
    error,
  } = api.device.fetchSetupDetails.useQuery({
    code: identifier!,
  });

  const {server_url } = record ?? {}

  const data = {
    ...record,
    server_url: server_url || "https://wallguard.ai/"
  };

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
        <p key={key} className="mb-[8px]">
          <strong> {key}: </strong>
          &nbsp; {(data as { [key: string]: any })?.[value] || "None"}
        </p>
      ))}
    </div>
  );
};

const SetupDetailsSummary = {
  label: "Step 3",
  show_summary: true,
  required: false,
  components: [
    {
      label: "Setup",
      component: <Summary form_key={"setup_details"} />,
    },
  ],
};

export default SetupDetailsSummary;

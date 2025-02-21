"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";

const fields = {
  Package: "package",
  "Installation Package": "installation_package",
  "Installation Confirmation": "installation_confirmation",
};

const Summary =  ({form_key}: { form_key: string }) => {

  const {
      data: record,
      refetch,
      error,
    } = api.device.fetchDownloadURL.useQuery({})

    useRefetchRecord({
      refetch,
      form_key,
    })

    if (error) {
      return (
        <div>
          {"Error:"}
          {error.message}
        </div>
      )
    }
  const data = {
    package: `curl -o pfSense-pkg-wallguard.pkg -L ${record || ''}`,
    installation_package: "pkg install Wallmon.pkg",
    installation_confirmation: "Wallmon --version",
  };

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

const DeviceBasicDetailsSummary = {
  label: "Step 2",
  required: false,
  show_summary: true,
  components: [
    {
      label: "Install",
      component: <Summary form_key={"installation_details"} />,
    },
  ],
};

export default DeviceBasicDetailsSummary;

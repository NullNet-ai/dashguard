"use client";

import { getActualDownloadURL } from "~/app/api/device/get_actual_download_url";

const fields = {
  Package: "package",
  "Installation Package": "installation_package",
  "Installation Confirmation": "installation_confirmation",
};

const Summary = async ({}: { form_key: string }) => {
  const download_url = await getActualDownloadURL();
  const data = {
    package: `curl -o pfSense-pkg-wallguard.pkg -L ${download_url}`,
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

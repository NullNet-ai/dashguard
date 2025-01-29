"use client";

const fields = {
  Package: "package",
  "Installation Package": "installation_package",
  "Installation Confirmation": "installation_confirmation",
};

const Summary = ({}: { form_key: string }) => {
  const data = {
    package: "curl-o https://wallmon.ai/wallmon.pkg",
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

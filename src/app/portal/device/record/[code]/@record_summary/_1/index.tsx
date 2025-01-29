"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { Badge } from "~/components/ui/badge";

const fields = {
  Name: "name",
  Type: "type",
  Grouping: "grouping",
  "Ip Address": "ip_address",
  "Instance Name": "instance_name",
  Version: "version",
  "Last Heartbeat": "last_heartbeat",
  Status: "status",
};

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.device.fetchSetupDetails.useQuery({
    code: identifier!,
  });

  const { data } = record ?? {};

  useRefetchRecord({
    refetch,
    form_key,
  });
  const mock_data = {
    ...data,
    name: "Primary Firewall",
    type: "pfSense",
    grouping: `Production\nStaging`,
    ip_address: "112.198.193.25",
    version: "2.7.2-Release",
    last_heartbeat: "01/17/2025 09:00",
    status: "Online",
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value], index) => (
        <div className="pt-2" key={index}>
          <div className="px-5">
            <div className="p-1 text-sm">
              <div>
                <span className="text-slate-400">{key}: </span>
                <span>
                  {key === "Status" ? (
                    <Badge variant="success">
                      {(mock_data as { [key: string]: any })?.[value] || "None"}
                    </Badge>
                  ) : (
                    (mock_data as { [key: string]: any })?.[value] || "None"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordShellSummary;

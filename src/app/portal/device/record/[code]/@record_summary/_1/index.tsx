"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { Badge } from "~/components/ui/badge";

const fields = {
  Type: "type",
  Status: "status",
  "Last Heartbeat": "last_heartbeat",
  Instance: "instance_name",
  "Host Name": "host_name",
  Version: "version",
  Grouping: "grouping",
  Interfaces: {
    WAN: "wan",
    LAN: "lan",
    OPT1: "opt1",
  },
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
  } = api.device.fetchBasicDetails.useQuery({
    code: identifier!,
  });

  const { data } = record ?? {};

  useRefetchRecord({
    refetch,
    form_key,
  });
  const mock_data = {
    ...data,
    type: data?.model,
    grouping: data?.grouping_name,
    ip_address: "112.198.193.25",
    version: "2.7.2-Release",
    last_heartbeat: "01/17/2025 09:00",
    status: "Online",
    interfaces: {
      wan: "192.168.1.1",
      lan: "192.168.1.2",
      opt1: "192.168.1.3",
    },
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
                      {(mock_data as { [key: string]: any })?.[
                        value as string
                      ] || "None"}
                    </Badge>
                  ) : key === "Interfaces" ? (
                    <div className="pl-4">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey}>
                          <span className="text-slate-400">{subKey}: </span>
                          <span>
                            {(mock_data.interfaces as { [key: string]: any })?.[
                              subValue
                            ] || "None"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    (mock_data as { [key: string]: any })?.[value as string] ||
                    "None"
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

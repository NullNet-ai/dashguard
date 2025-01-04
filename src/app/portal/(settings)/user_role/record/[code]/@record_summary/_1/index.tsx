"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";

const fields = {
  Name: "role",
};

const RecordShellSummary = ({
  form_key,
  identifier,
  main_entity,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "role"],
  });

  const { data } = record ?? {};

  useRefetchRecord({
    refetch,
    form_key,
  });

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
                  {(data as { [key: string]: any })?.[value] || "None"}
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

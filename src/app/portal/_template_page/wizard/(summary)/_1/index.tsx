"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const Summary = ({
  form_key,
  identifier,
  entity,
}: {
  form_key: string;
  identifier: string;
  entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ["id", "code", "status"],
    main_entity: entity,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  // TODO: Implement Summary component UI manually
  return <div>{JSON.stringify(record, null, 2)}</div>;
};

export default Summary;

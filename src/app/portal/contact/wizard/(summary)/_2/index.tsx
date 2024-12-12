"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const StepTwoCategory = ({
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
    pluck_fields: ["id", "code", "categories"],
  });

  const { data } = record || {};
  const { categories } = data || {};

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p>
        <strong> Categories: </strong>
        &nbsp; {categories?.length ? categories.join(", ") : "None"}
      </p>
    </div>
  );
};

export default StepTwoCategory;

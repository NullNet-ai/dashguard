"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const fields = {
  "Phone Number": "primary_phone_number",
  Email: "email",
};

const StepOneBasicDetails = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.contact.getBasicDetails.useQuery({
    code: identifier!,
  });

  const { data } = record || {};

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
        <p key={key}>
          <strong> {key}: </strong>
          {/* @ts-expect-error - Required for the icon to work */}
          &nbsp; {data[value] || "None"}
        </p>
      ))}
    </div>
  );
};

export default StepOneBasicDetails;

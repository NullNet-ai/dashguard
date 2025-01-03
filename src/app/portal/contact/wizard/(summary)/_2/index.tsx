"use client";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const fields = {
  "First Name": "first_name",
  "Last Name": "last_name",
  "Middle Name": "middle_name",
  "Date of Birth": "date_of_birth",
  Address: "address",
};

const ContactDetailsSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const { data, refetch, error } = api.contact.getContactWithAddress.useQuery({
    code: identifier!,
    pluck_fields: [
      "id",
      "first_name",
      "last_name",
      "middle_name",
      "date_of_birth",
      "address_id",
    ],
  });

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
        <p key={key} className="mb-[15px]">
          <strong> {key}: </strong>
          &nbsp; {data?.[value] || "None"}
        </p>
      ))}
    </div>
  );
};

export default ContactDetailsSummary;

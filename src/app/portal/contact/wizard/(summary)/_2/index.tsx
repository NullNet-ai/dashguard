"use client";
import { usePathname } from "next/navigation";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const fields = {
  "First Name": "first_name",
  "Last Name": "last_name",
  "Middle Name": "middle_name",
  "Date of Birth": "date_of_birth",
  Address: "address",
};

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , , _, identifier] = pathName.split("/");
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
        <p key={key} className="mb-[8px] no-underline">
          <strong> {key}: </strong>
          &nbsp; {data?.[value] || "None"}
        </p>
      ))}
    </div>
  );
};

const SummaryConfig = {
  label: "Step 2",
  required: true,
  components: [
    {
      label: "Contact Details",
      component: <Summary form_key={"contact_details"} />,
    },
  ],
};

export default SummaryConfig;

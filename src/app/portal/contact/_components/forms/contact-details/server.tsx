import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ContactDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    id: identifier!,
    pluck_fields: [
      "id",
      "first_name",
      "last_name",
      "middle_name",
      "date_of_birth",
      "address_id",
    ],
    main_entity: "contact",
  });

  const default_values = response?.data;
  return (
    <div className="space-y-2">
      <ContactDetails
        defaultValues={default_values}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;

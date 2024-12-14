import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ContactDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.contact.getContactWithAddress({
    code: identifier!,
    pluck_fields: [
      "id",
      "first_name",
      "last_name",
      "middle_name",
      "date_of_birth",
      "address_id",
    ],
    address_pluck_fields: [
      "address",
      "address_line_one",
      "address_line_two",
      "latitude",
      "longitude",
      "place_id",
      "street_number",
      "street",
      "region",
      "region_code",
      "country_code",
      "postal_code",
      "country",
      "state",
      "city",
    ],
  });

  const default_values = response || {};

  const { address, ...rest } = default_values;

  return (
    <div className="space-y-2">
      <ContactDetails
        defaultValues={{ ...rest, details: address || {} }}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;

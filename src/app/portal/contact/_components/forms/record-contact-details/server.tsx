import { api } from "~/trpc/server";
import { headers } from "next/headers";
import RecordContactDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields: [
      "id",
      "first_name",
      "last_name",
      "middle_name",
      "date_of_birth",
      "address_id",
    ],
    is_multiple: true,
  });

  const address_id = response?.address_id;

  let details = {};
  if (address_id) {
    const response = await api.record.getById({
      id: address_id,
      main_entity: "address",
      pluck_fields: [
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

    details = response?.data || {};
  }

  const default_values = response;
  return (
    <div className="space-y-2">
      <RecordContactDetails
        defaultValues={{ ...default_values, details }}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;

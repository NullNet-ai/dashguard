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
    ],
  });

  const default_values = response;
  return (
    <div className="space-y-2">
      <RecordContactDetails
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

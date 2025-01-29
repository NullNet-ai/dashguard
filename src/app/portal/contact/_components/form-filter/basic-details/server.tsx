import { headers } from "next/headers";
import { api } from "~/trpc/server";
import BasicDetails from "./client";
const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "role", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");

  const record_data = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields,
    is_multiple: true,
  });
  const _pluck = [
    "id",
    "code",
    "categories",
    "organization_id",
    "first_name",
    "middle_name",
    "last_name",
    "email_address",
    "contact_status",
    "status",
    "created_date",
    "updated_date",
    "created_time",
    "updated_time",
    "created_by",
    "updated_by",
  ];

  const default_values = record_data;

  const contact_id = default_values?.id;

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={{
          ...default_values,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          pluck_fields : _pluck,
        }}
        selectedRecords={contact_id ? [default_values] : []}
      />
    </div>
  );
};

export default FormServerFetch;

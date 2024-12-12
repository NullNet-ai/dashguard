import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "role", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");

  const record_data = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields,
  });

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
          pluck_fields,
        }}
        selectedRecords={contact_id ? [default_values] : []}
      />
    </div>
  );
};

export default FormServerFetch;

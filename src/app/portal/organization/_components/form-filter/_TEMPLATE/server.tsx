import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import { getGridCacheData } from "~/lib/grid-get-cache-data";
import defaultSorting from "./_config/sorting";

const form_filter_entity = "";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "email", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");

  // @ts-expect-error - Fix type later
  const record_data = await api[main_entity].fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields,
    form_filter_entity,
  });

  const default_values = record_data;

  const contact_id = default_values?.id;

  const selectedRecords = default_values[form_filter_entity] || [];

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={
          selectedRecords.length
            ? {
                ...default_values,
              }
            : null
        }
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          pluck_fields,
        }}
        selectedRecords={selectedRecords.length ? [default_values] : []}
      />
    </div>
  );
};

export default FormServerFetch;

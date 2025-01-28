import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import { defaultSorting } from "../../../grid/_config/sorting";
import { getGridCacheData } from "~/lib/grid-get-cache-data";

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
  const _pluck = [
    "id",
    "code",
    "email",
    `${main_entity}_id`,
    "status",
    "created_date",
    "created_time",
    "updated_date",
    "updated_time",
  ];
  const { sorting } = (await getGridCacheData()) ?? {};

  // @ts-expect-error - Fix type later
  const { items = [], totalCount } = await api[main_entity].formFilterGrid({
    entity: main_entity,
    pluck: _pluck,
    sorting: sorting?.length ? sorting : defaultSorting,
    current: 0,
    limit: 100,
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
        grid_data={{ items, totalCount }}
      />
    </div>
  );
};

export default FormServerFetch;

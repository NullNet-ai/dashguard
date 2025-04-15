import { api } from "~/trpc/server";
import { headers } from "next/headers";
import RoleDetails from "./client";
import { defaultSorting } from "../../../grid/_config/sorting";
import { getGridCacheData } from "~/lib/grid-get-cache-data";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "role", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");

  const record_data = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields,
  });

  const _pluck = [
    "id",
    "code",
    "role",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const { sorts } = (await getGridCacheData()) ?? {};

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    current: 0,
    limit: 100,
  });

  const default_values = record_data?.data;

  const user_role_id = default_values?.id;

  return (
    <div className="space-y-2">
      <RoleDetails
        defaultValues={{
          ...default_values,
        }}
        params={{
          id: user_role_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          pluck_fields: _pluck,
        }}
        selectedRecords={user_role_id ? [default_values] : []}
        grid_data={{ items, totalCount }}
      />
    </div>
  );
};

export default FormServerFetch;

import { api } from "~/trpc/server";
import gridColumns from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { headers } from "next/headers";
import { defaultSorting } from "./_config/sorting";
import { getGridCacheData } from "~/lib/grid-get-cache-data";

export default async function UserRoleGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, ,] = pathname.split("/");
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
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      defaultSorting={defaultSorting}
      sorting={sorts?.sorting?.length ? sorts?.sorting : []}
      data={items}
      config={{
        entity: main_entity!,
        title: "User Roles",
        columns: gridColumns,
        enableAutoCreate: false,
      }}
    />
  );
}

import { api } from "~/trpc/server";
import gridColumns from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { headers } from "next/headers";
import { defaultSorting } from "./_config/sorting";


export default async function UserRoleGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const sorting = await api.grid.getReportSorting();

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const _pluck = ["id", "code", "name","created_date", "updated_date"];

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
    sorting: sorting?.length ? sorting : defaultSorting,
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      config={{
        entity: main_entity!,
        title: "New Grid",
        columns: gridColumns,
      }}
    />
  );
}

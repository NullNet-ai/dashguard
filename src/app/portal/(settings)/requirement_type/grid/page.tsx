import { api } from "~/trpc/server";
import gridColumns from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { headers } from "next/headers";

export default async function RequirementTypeGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const _pluck = [
    "id",
    "code",
    "requirement_type",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const { items = [], totalCount } = await api.grid.items({
    entity: main_entity!,
    pluck: _pluck,
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: main_entity!,
        title: "Requirement Typew",
        columns: gridColumns,
      }}
    />
  );
}

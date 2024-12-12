import { api } from "~/trpc/server";
import gridColumns from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";

export default async function PositionGridPage({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const _pluck = [
    "id",
    "code",
    "title",
    "activation_date",
    "expiration_date",
    "position_status",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const { items = [], totalCount } = await api.grid.items({
    entity: "position",
    pluck: _pluck,
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: "position",
        title: "Positions",
        columns: gridColumns,
        defaultValues: {
          position_status: "Open",
        },
      }}
    />
  );
}

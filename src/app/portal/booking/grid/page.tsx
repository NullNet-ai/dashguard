import { api } from "~/trpc/server";
import gridColumns from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";

export default async function BookingsGridPage({
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
    "start_date",
    "start_time",
    "timezone",
    "interview_location",
    "result",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const { items = [], totalCount } = await api.booking.mainGrid({
    entity: "booking",
    pluck: _pluck,
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      config={{
        entity: "booking",
        title: "Bookings",
        columns: gridColumns,
      }}
    />
  );
}

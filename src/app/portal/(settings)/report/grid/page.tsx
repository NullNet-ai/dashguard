import { api } from "~/trpc/server";
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { headers } from "next/headers";
export default async function Page({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");
  const _pluck = [
    "id",
    "code",
    "report_name",
    "entity_name",
    "status",
    "created_date",
    "updated_date",
    "created_by",
    "updated_by",
  ];

  // ! JOIN AVAILABLE KINDLY USE and Transform the data ( Map Reduce)
  const results = await api.report.fetchReports({
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
    entity: main_entity!,
    pluck: _pluck,
  });

  return (
    <Grid
      totalCount={results.record_count || 0}
      data={results.data}
      config={{
        entity: main_entity!,
        title: "Reports",
        columns: gridColumns,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
      }}
    />
  );
}

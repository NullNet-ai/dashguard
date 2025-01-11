import { api } from "~/trpc/server";
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { defaultSorting } from "./_config/sorting";
import { defaultAdvanceFilter } from "./_config/advanceFilter";
import { getGridCacheData } from "~/lib/grid-get-cache-data";

// import EditComponent from "./customDefaultActions/Edit";
export default async function Page({
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
    "categories",
    "organization_id",
    "first_name",
    "middle_name",
    "last_name",
    "email_address",
    "contact_status",
    "status",
    "created_date",
    "updated_date",
    "created_time",
    "updated_time",
    "created_by",
    "updated_by",
  ];

  const { sorting, pagination, filters } = (await getGridCacheData()) ?? {};

  const { items = [], totalCount } = await api.contact.mainGrid({
    current: +(pagination?.current_page ?? "0"),
    limit: +(pagination?.limit_per_page ?? "100"),
    entity: "contact",
    pluck: _pluck,
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : [],
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter || []}
      advanceFilter={filters?.reportFilters || []}
      sorting={sorting || []}
      pagination={pagination}
      config={{
        entity: "contact",
        title: "Contacts",
        columns: gridColumns,
        defaultValues: {
          categories: ["Contact", "Employee"],
        },
        enableAutoCreate: false,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: "contact",
          resolver: "mainGrid",
          query_params: {
            entity: "contact",
            pluck: _pluck,
          },
        },
      }}
    />
  );
}

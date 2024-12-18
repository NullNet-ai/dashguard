import { api } from "~/trpc/server";
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { defaultSorting } from "./_config/sorting";
import { searchableFields } from "./_config/searchableFields";
import { defaultAdvanceFilter } from "./_config/advanceFilter";
import { ISearchItem } from "~/components/platform/Grid/Search/types";

interface IReportFilter {
  advanceFilter: ISearchItem[];
  reportFilters: ISearchItem[];
}
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
  ];

  const sorting = await api.grid.getReportSorting();
  const filters = (await api.grid.getReportFilter()) as IReportFilter

  // ! JOIN AVAILABLE KINDLY USE and Transform the data ( Map Reduce)
  const { items = [], totalCount } = await api.contact.mainGrid({
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
    entity: "contact",
    pluck: _pluck,
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : defaultAdvanceFilter,
  });

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter}
      advanceFilter={filters.reportFilters || []}
      sorting={sorting || []}
      config={{
        entity: "contact",
        title: "Contacts",
        columns: gridColumns,
        defaultValues: {
          categories: ["Contact"],
        },
        enableAutoCreate: false,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchableFields: searchableFields,
      }}
    />
  );
}

import { api } from "~/trpc/server";
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import { defaultSorting } from "./_config/sorting";
import { defaultAdvanceFilter } from "./_config/advanceFilter";
import { getGridCacheData } from "~/lib/grid-get-cache-data";
import AccountGridExpansion from "../_components/grids/AccountGridExpansion";

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

  const { sorts, pagination, filters, columns : columnOrder } = (await getGridCacheData()) ?? {};

  const defaultPagination = pagination?.limit_per_page ? pagination : {
    current_page: +(pagination?.current_page ?? "1"),
    limit_per_page: +(pagination?.limit_per_page?? "100"),
  };

  const { items = [], totalCount } = await api.contact.mainGrid({
    current: +(defaultPagination?.current_page ?? "1"),
    limit: +(defaultPagination?.limit_per_page ?? "100"),
    entity: "contact",
    pluck: _pluck,
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
    advance_filters: filters?.advanceFilter?.length
      ? filters?.advanceFilter
      : filters?.groupAdvanceFilters?.length ? [] : defaultAdvanceFilter,
    group_advance_filters: filters?.groupAdvanceFilters?.length
     ? filters?.groupAdvanceFilters
      : [],
  });
  
  const gridAdvanceFilter = filters?.groupAdvanceFilters?.length
  ? filters?.groupAdvanceFilters
   :  filters?.advanceFilter?.length
   ? filters?.advanceFilter
   : defaultAdvanceFilter

  const gridDefaultAdvanceFilter =  filters?.groupAdvanceFilters?.length
  ? filters?.groupAdvanceFilters
   : gridAdvanceFilter;

  return (
    <Grid
      totalCount={totalCount || 0}
      data={items}
      defaultSorting={sorts?.defaultSorting.length ? sorts?.defaultSorting : defaultSorting}
      defaultAdvanceFilter={gridDefaultAdvanceFilter}
      advanceFilter={gridAdvanceFilter}
      sorting={sorts?.sorting || []}
      pagination={defaultPagination}
      config={{
        isInfinite: true,
        entity: "contact",
        title: "Contacts",
        columnsOrder: columnOrder,
        columns: gridColumns,
        defaultValues: {
          categories: ["Contact", "Employee"],
        },
        defaultShownColumns: [
          "raw_phone_number",
          "email",
        ],
        enableAutoCreate: false,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        searchConfig: {
          router: "contact",
          resolver: "mainGrid",
          query_params: {
            entity: "contact",
            pluck: _pluck,
            group_advance_filters : filters?.groupAdvanceFilters,
          },
        },
        enableRowExpansion: true,
        rowExpansionBuilder: <AccountGridExpansion />
      }}
    />
  );
}

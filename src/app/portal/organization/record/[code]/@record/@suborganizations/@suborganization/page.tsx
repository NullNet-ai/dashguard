import { headers } from "next/headers";
import { EOperator } from "@dna-platform/common-orm";
import { api } from "~/trpc/server";
import Grid from "~/components/platform/Grid/Server";
import React from "react"; // Import React if needed
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "../_config/columns";
import { getGridCacheData } from "~/lib/grid-get-cache-data";
import { defaultSorting } from "../_config/sorting";
import { ISearchItem } from "~/components/platform/Grid/Search/types";

export default async function RecordTabContainer({
  searchParams = {},
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
}): Promise<React.ReactElement | null> {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathname.split("/");
  const _pluck = [
    "id",
    "code",
    "name",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const { sorts, pagination, filters } = (await getGridCacheData()) ?? {};
  const response = await api.organization.getByCode({
    code: identifier!,
    pluck_fields: ["id", "name"],
  });
  const record_id = response?.data?.id;
  const defaultAdvanceFilter = [
    {
      type: "criteria",
      field: "parent_organization_id",
      operator: EOperator.EQUAL,
      values: [record_id!],
      display_value: response?.data?.name,
      default: true,
      label: "Parent Organization",
    },
  ] as ISearchItem[];
  const { items = [], totalCount } = await api.grid.items({
    current: +(searchParams.page ?? "0"),
    limit: +(searchParams.perPage ?? "100"),
    entity: "organization",
    pluck: _pluck,
    sorting: sorts?.sorting?.length ? sorts?.sorting : defaultSorting,
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
      advanceFilter={filters?.reportFilters || []}
      sorting={sorts?.sorting || []}
      pagination={pagination}
      config={{
        entity: "organization",
        title: "Organizations",
        columns: gridColumns,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        layer: "sub",
        searchConfig: {
          query_params: {
            entity: "organization",
            pluck: _pluck,
          },
        },
      }}
    />
  );
}

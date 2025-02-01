"use client";
import React, { useEffect } from "react";
import Grid from "~/components/platform/Grid/Client";
import { api } from "~/trpc/react";
import StatusCell from "~/components/ui/status-cell";

const OrganizationGridExpansion = (props: any) => {
  const { rowData } = props ?? {};
  const _pluck = ["id", "code", "name", "status"];

  const gridColumns = [
    {
      header: "State",
      accessorKey: "status",
      enableResizing: false,
      cell: ({ row }) => {
        const value = row?.original?.status;
        return <StatusCell value={value} />;
      },
    },
    {
      header: "ID",
      accessorKey: "code",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
  ];

  // const { sorting, pagination, filters } = (await getGridCacheData()) ?? {};
  const defaultSorting = [
    {
      id: "created_date",
      desc: true,
    },
  ];

  const pagination = {
    current_page: 0,
    limit_per_page: 100,
  };

  const defaultFilter = [
    {
      type: "criteria",
      field: "id",
      operator: "equal",
      values: [rowData.organization_id],
    },
  ];
  const { data, isLoading, refetch, error } = api.grid.items.useQuery({
    current: 0,
    limit: 100,
    entity: "organization",
    pluck: _pluck,
    sorting: defaultSorting,
    // advance_filters: defaultFilter,
  });

  useEffect(() => {
    refetch();
  }, []);
  
  const { items = [], totalCount = 0 } = data ?? {};

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <p>Organizations</p>
      <Grid
        totalCount={totalCount || 0}
        data={items}
        defaultSorting={defaultSorting}
        // defaultAdvanceFilter={defaultAdvanceFilter || []}
        // advanceFilter={filters?.reportFilters || []}
        sorting={defaultSorting || []}
        pagination={pagination}
        config={{
          entity: "organization",
          title: "Organizations",
          columns: gridColumns,
          disableDefaultAction: true,
          enableRowClick: false,
          enableAutoCreate: false,
          enableRowSelection: false,
          enableRowExpansion: false,
        }}
        parentType="grid_expansion"
      />
    </>
  );
};

export default OrganizationGridExpansion;

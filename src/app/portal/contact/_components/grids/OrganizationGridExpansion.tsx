'use client'

import Grid from '~/components/platform/Grid/Client'
import { type IExpansionComponentProps } from '~/components/platform/Grid/types'
import StatusCell from '~/components/ui/status-cell'
import useFetchGridData from '~/hooks/useFetchGridData'

const OrganizationGridExpansion = (props: IExpansionComponentProps) => {
  const _pluck = ['id', 'code', 'name', 'status']

  const gridColumns = [
    {
      header: 'State',
      accessorKey: 'status',
      enableResizing: false,
      cell: ({ row }: any) => {
        const value = row?.original?.status
        return <StatusCell value={value} />
      },
    },
    {
      header: 'ID',
      accessorKey: 'code',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
  ]

  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ]

  const pagination = {
    current_page: 1,
    limit_per_page: 50,
  };
  const defaultFilter = [
    {
      type: 'criteria',
      field: 'id',
      operator: 'equal',
      values: [props?.rowData?.organization_id],
      entity: 'organization',
    },
  ]
  

  const { fetchData, data, error, isLoading } = useFetchGridData({
    current: pagination?.current_page,
    limit: pagination?.limit_per_page,
    entity: 'organization',
    pluck: _pluck,
    sorting: defaultSorting,
    advance_filters: defaultFilter,
  });

  const { items = [], totalCount = 0 } = data ?? {};

  return (
    <Grid
      parentExpanded={props?.parentExpanded}
      totalCount={totalCount || 0}
      data={items}
      isLoading={isLoading}
      isError={error}
      gridLevel={3}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultFilter || []}
      sorting={defaultSorting || []}
      pagination={pagination}
      config={{
        entity: 'organization',
        title: 'Organizations',
        columns: gridColumns,
        disableDefaultAction: true,
        enableRowClick: false,
        enableAutoCreate: false,
        enableRowSelection: false,
        enableRowExpansion: false,
        onFetchRecords: fetchData,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: 'organization',
            pluck: _pluck,
          },
        },
      }}
      parentType="grid_expansion"
    />
  )
};

export default OrganizationGridExpansion

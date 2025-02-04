'use client'
import Grid from '~/components/platform/Grid/Client'
import StatusCell from '~/components/ui/status-cell'

import ErrorPage from './ErrorPage'
import useFetchData from './hooks/useFetchData'
import OrganizationGridExpansion from './OrganizationGridExpansion'

const AccountGridExpansion = (props: any) => {
  const { rowData } = props ?? {}
  const _pluck = [
    'id',
    'code',
    'account_id',
    'organization_id',
    'role_id',
    'status',
  ]

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
      header: 'Username',
      accessorKey: 'account_id',
    },
    {
      header: 'Organization',
      accessorKey: 'organization_id',
    },
    {
      header: 'Role',
      accessorKey: 'role_id',
    },
  ]

  // const { sorting, pagination, filters } = (await getGridCacheData()) ?? {};
  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ]

  const pagination = {
    current_page: 0,
    limit_per_page: 100,
  }

  const defaultFilter = [
    {
      type: 'criteria',
      field: 'contact_id',
      operator: 'equal',
      values: [rowData.id],
    },
  ]

  const { fetchData, data, error, isLoading } = useFetchData({
    current: 0,
    limit: 100,
    entity: 'organization_account',
    pluck: _pluck,
    sorting: defaultSorting,
    advance_filters: defaultFilter,
  })

  const { items = [], totalCount = 0 } = data ?? {}

  if (error) return <ErrorPage refetch={fetchData} />

  return (
    <>
      <p>Accounts</p>
      <Grid
        config={{
          entity: 'organization_account',
          title: 'Accounts',
          columns: gridColumns,
          disableDefaultAction: true,
          enableRowClick: false,
          enableAutoCreate: false,
          enableRowSelection: false,
          enableRowExpansion: true,
          rowExpansionBuilder: <OrganizationGridExpansion />,
        }}
        data={items}
        isLoading={isLoading}
        defaultSorting={defaultSorting}
        // defaultAdvanceFilter={defaultAdvanceFilter || []}
        // advanceFilter={filters?.reportFilters || []}
        pagination={pagination}
        parentType='grid_expansion'
        sorting={defaultSorting || []}
        totalCount={totalCount || 0}
        onRefetch={(args) => {
          fetchData(args);
        }}
      />
    </>
  )
}

export default AccountGridExpansion

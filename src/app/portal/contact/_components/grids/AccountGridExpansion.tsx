'use client';
import Grid from '~/components/platform/Grid/Client';
import StatusCell from '~/components/ui/status-cell';

import useFetchData from './hooks/useFetchData';
import OrganizationGridExpansion from './OrganizationGridExpansion';

const AccountGridExpansion = (props: any) => {
  const { rowData } = props ?? {};
  const _pluck = [
    'id',
    'code',
    'account_id',
    'organization_id',
    'role_id',
    'status',
  ];

  const gridColumns = [
    {
      header: 'State',
      accessorKey: 'status',
      enableResizing: false,
      cell: ({ row }: any) => {
        const value = row?.original?.status;
        return <StatusCell value={value} />;
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
  ];

  // const { sorting, pagination, filters } = (await getGridCacheData()) ?? {};
  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ];

  const pagination = {
    current_page: 1,
    limit_per_page: 50,
  };

  const defaultFilter = [
    {
      type: 'criteria',
      field: 'contact_id',
      operator: 'equal',
      entity: 'organization_account',
      values: [rowData.id],
    },
  ];

  const { fetchData, data, error, isLoading } = useFetchData({
    current: pagination?.current_page,
    limit: pagination?.limit_per_page,
    entity: 'organization_account',
    pluck: _pluck,
    sorting: defaultSorting,
    advance_filters: defaultFilter,
  });

  const { items = [], totalCount = 0 } = data ?? {};

  return (
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
        onFetchRecords: fetchData,
        searchConfig: {
          router: 'grid',
          resolver: 'items',
          query_params: {
            entity: 'organization_account',
            pluck: _pluck,
          },
        },
      }}
      data={items}
      gridLevel={2}
      isError={error}
      isLoading={isLoading}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultFilter || []}
      pagination={pagination}
      parentType="grid_expansion"
      sorting={defaultSorting || []}
      totalCount={totalCount || 0}
      hideSearch={false}
      showPagination={true}
    />
  );
};

export default AccountGridExpansion;

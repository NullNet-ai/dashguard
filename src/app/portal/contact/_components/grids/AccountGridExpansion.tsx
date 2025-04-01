'use client';
import Grid from '~/components/platform/Grid/Client';
import StatusCell from '~/components/ui/status-cell';

import { type IExpansionComponentProps } from '~/components/platform/Grid/types';
import OrganizationGridExpansion from './OrganizationGridExpansion';
import useFetchGridData from '~/hooks/useFetchGridData';

const AccountGridExpansion = (props: IExpansionComponentProps ) => {
  const { rowData, grouping, viewMode } = props ?? {};

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
      values: [rowData?.id],
    },
  ];

  const { fetchData, data, error, isLoading } = useFetchGridData({
    current: pagination?.current_page,
    limit: pagination?.limit_per_page,
    entity: 'organization_account',
    pluck: _pluck,
    sorting: defaultSorting,
    advance_filters: defaultFilter,
    grouping: grouping?.[0] ? [grouping?.[0]] : [],
  });

  const { items = [], totalCount = 0 } = data ?? {};

  return (
    <Grid
      parentExpanded={props.parentExpanded}
      config={{
        entity: 'organization_account',
        title: 'Accounts',
        columns: gridColumns,
        disableDefaultAction: true,
        enableRowClick: false,
        enableAutoCreate: false,
        enableRowSelection: false,
        enableRowExpansion: true,
        viewMode: viewMode || 'table',
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
      grouping={grouping || []}
    />
  );
};

export default AccountGridExpansion;

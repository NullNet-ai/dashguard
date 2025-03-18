'use client';
import Grid from '~/components/platform/Grid/Client';
import StatusCell from '~/components/ui/status-cell';

import { type IExpansionComponentProps } from '~/components/platform/Grid/types';
import useFetchGridData from '~/hooks/useFetchGridData';
import GridProvider from '../Provider';
import MyTableBody from '../TableBody';
import gridColumns from '~/app/portal/contact/grid/_config/columns';
import { defaultAdvanceFilter } from '~/app/portal/contact/grid/_config/advanceFilter';

const GridGroupingExpansion = (props: IExpansionComponentProps) => {
  const { rowData } = props ?? {};
  const { field, value } = rowData ?? {};
  const _pluck = [
    'id',
    'code',
    'categories',
    'organization_id',
    'first_name',
    'middle_name',
    'last_name',
    'email_address',
    'contact_status',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
    'created_by',
    'updated_by',
  ];

  // const gridColumns = [
  //   {
  //     header: 'State',
  //     accessorKey: 'status',
  //     enableResizing: false,
  //     cell: ({ row }: any) => {
  //       const value = row?.original?.status;
  //       return <StatusCell value={value} />;
  //     },
  //   },
  //   {
  //     header: 'Username',
  //     accessorKey: 'account_id',
  //   },
  //   {
  //     header: 'Organization',
  //     accessorKey: 'organization_id',
  //   },
  //   {
  //     header: 'Role',
  //     accessorKey: 'role_id',
  //   },
  // ];

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

  const gridFilter = [
    {
      type: 'criteria',
      field,
      operator: 'equal',
      entity: 'contact',
      values: [value],
    },
  ];

  const { fetchData, data, error, isLoading } = useFetchGridData(
    {
      current: pagination?.current_page,
      limit: pagination?.limit_per_page,
      entity: 'contact',
      pluck: _pluck,
      sorting: defaultSorting,
      advance_filters: gridFilter,
    },
    {
      resolver: 'mainGrid',
      router: 'contact',
    },
  );

  const { items = [], totalCount = 0 } = data ?? {};

  const sampleDistinctData = [
    {
      id: '1',
      is_group_by: true,
      value: ['Contact'],
      field: 'categories',
      contacts: {
        status: 'Active',
        count: 2,
      },
    },
  ];

  return (
    <GridProvider
      // advanceFilter={advanceFilter}
      config={{
        columns: gridColumns,
        entity: 'contact',
        enableRowExpansion: true,
      }}
      data={sampleDistinctData}
      // defaultAdvanceFilter={defaultAdvanceFilter}
      defaultSorting={defaultSorting}
      // initialSelectedRecords={initialSelectedRecords}
      pagination={pagination}
      // parentType={parentType}
      sorting={defaultSorting}
      totalCount={totalCount}
      // onSelectRecords={onSelectRecords}
      // gridLevel={gridLevel}
      // gridType={gridType}
    >
      <div className="hidden lg:grid">
        <MyTableBody
          // reachEnd={isEndReached}
          // showAction={showAction}
          // gridLevel={gridLevel}
          // isLoading={isLoading}
          showPagination={false}
          // parentExpanded={parentExpanded}
        />
      </div>
    </GridProvider>
  );
};

export default GridGroupingExpansion;

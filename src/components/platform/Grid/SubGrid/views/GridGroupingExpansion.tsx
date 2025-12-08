'use client';

import { type IGridGroupingExpansionProps } from '~/components/platform/Grid/types';
import { CardFooter } from '~/components/ui/card';
import { Loader } from '~/components/ui/loader';
import Pagination from '../../Pagination';
import GridProvider, { GridContext } from '../../Provider';
import ErrorPage from '../../common/ErrorPage';
import { useSidebar } from '~/components/ui/sidebar';
import { resolveAdvanceFilter } from '../../Search/utils/advanceFilterResolver';
import useFetchGridData from '../../hooks/useFetchGridData';
import GridGroupRows from './GridGroupRows';
import { TableRow } from '~/components/ui/table';
import { useContext } from 'react';
import { formatSortingFields } from '../../utils/formatSortingFields';
import { useIsMobile } from '~/hooks/use-mobile';

const GridGroupingExpansion = (props: IGridGroupingExpansionProps) => {
  const {
    rowData,
    config,
    initialColumns,
    grouping,
    visibleColumns,
    parentGroupData,
    gridState,
    parentGroupFields,
    parentType,
    rowIndex,
    originalGroups,
    current_tab_id,
  } = props ?? {};

  const level = (originalGroups?.length ?? 0) - (grouping?.length ?? 0);
  const { open } = useSidebar();
  const { state, actions } = useContext(GridContext);
  const groups = state?.table.getState().grouping ?? [];
  const isMobile = useIsMobile();

  const pagination = {
    current_page: 1,
    limit_per_page: 10,
  };
  const defaultSorting = [
    {
      id: 'created_date',
      desc: true,
    },
  ];
  const resolvedSorting = formatSortingFields(
    gridState?.sorting ?? [],
    initialColumns,
  );

  const gridQueryConfigs = {
    defaultSorting: resolvedSorting,
    defaultAdvanceFilter: gridState?.defaultAdvanceFilter,
    advanceFilter: gridState?.advanceFilter,
    sorting: resolvedSorting,
    pagination: pagination,
  };

  const advanceFilterItems = gridState?.advanceFilter?.map((item) => {
    if (item?.type === 'criteria') {
      return {
        ...item,
        entity: item?.entity || config?.entity,
      };
    }
    return item;
  });
  const constructGridFilter = (data: Record<string, any>[]) => {
    const gridFilter = data?.reduce((acc, item, index) => {
      const { field, value, entity } = item ?? {};
      const filterItem = {
        type: 'criteria',
        field,
        operator: value === null || value === undefined ? 'is_null' : 'equal',
        entity: entity || config.entity,
        values: Array.isArray(value)
          ? value
          : value === null || value === undefined
            ? []
            : [value],
      };
      if (index > 0) {
        return [...acc, { type: 'operator', operator: 'and' }, filterItem];
      }
      return [...acc, filterItem];
    }, [] as any);

    return gridFilter;
  };
  const groupAdvanceFilters =
    gridState?.config?.searchConfig?.query_params?.group_advance_filters;

  const gridFilters = resolveAdvanceFilter({
    currentAdvanceFilter: groupAdvanceFilters?.length
      ? groupAdvanceFilters
      : (advanceFilterItems ?? []),
    additionalFilter: constructGridFilter([
      ...(parentGroupData ?? []),
      rowData,
    ]),
  });
  const groupFields = grouping?.map((item) => {
    const columnConfig = initialColumns?.find(
      (column: any) => column?.accessorKey === item,
    ) as any;
    const label = (columnConfig?.header as string) ?? '';
    const entity = columnConfig?.search_config?.entity || config.entity;
    const field = columnConfig?.search_config?.field || item;
    const groupSort = parentGroupFields?.find((item) => item?.field === field);
    return {
      value: item,
      field: `${entity}.${field}`,
      label,
      desc: typeof groupSort?.desc === 'boolean' ? groupSort?.desc : false,
      ...(columnConfig?.sort_config ?? {}),
    };
  });
  const groupSort = parentGroupFields?.find(
    (item) => item?.field === groupFields?.[0]?.field,
  );
  const newSorting = groupSort
    ? [
        {
          id: groupSort?.value,
          desc: groupSort?.desc,
          sort_key: groupSort?.field,
          is_case_sensitive_sorting:
            groupSort?.is_case_sensitive_sorting ?? false,
        },
      ]
    : [];

  const { fetchData, data, error, isLoading } = useFetchGridData(
    {
      ...(config.searchConfig?.query_params || {}),
      current: pagination?.current_page,
      limit: pagination?.limit_per_page,
      entity: config.entity,
      pluck: config.searchConfig?.query_params?.pluck,
      sorting: newSorting?.length
        ? newSorting
        : gridQueryConfigs?.sorting?.length
          ? gridQueryConfigs?.sorting
          : defaultSorting,
      grouping: groupFields?.[0]?.field ? [groupFields[0].field as string] : [],
      ...gridFilters,
    },
    {
      resolver: config.searchConfig?.resolver ?? 'items',
      router: config.searchConfig?.router ?? 'grid',
    },
  );

  const { items = [], totalCount = 0 } = data ?? {};
  const newItems = items.map((item) => {
    return { ...item, expand: '', group_by: '' };
  });

  const newColumnOrder = config?.columnsOrder?.length
    ? [
        {
          header: 'expand',
          accessorKey: 'expand',
          label: 'expand',
          isShow: true,
          order: 0,
        },
        {
          header: 'Group By',
          accessorKey: 'group_by',
          label: 'Group By',
          isShow: true,
          order: 1,
        },
        ...(config?.columnsOrder ?? []),
      ].map((col: any, index: number) => {
        return {
          ...col,
          order: index,
        };
      })
    : [];

  let newVisibleColumns =
    groups?.length <= 1
      ? [...visibleColumns].some((col: any) => col?.accessorKey === 'group_by')
        ? [...visibleColumns]
        : [
            {
              header: 'group_by',
              accessorKey: 'group_by',
              data_type: 'string',
            },
            ...visibleColumns,
          ]
      : [...visibleColumns];

  newVisibleColumns = [...newVisibleColumns].some(
    (col: any) => col?.accessorKey === 'expand',
  )
    ? [...newVisibleColumns]
    : [
        {
          header: 'expand',
          accessorKey: 'expand',
        },
        ...newVisibleColumns,
      ];

  if (isLoading && !items?.length) {
    return (
      <tr>
        <td colSpan={state?.table.getVisibleLeafColumns().length}>
          <div className="flex h-full items-center justify-center">
            <Loader
              className="bg-primary text-primary"
              label="Fetching data..."
              size="md"
              variant="circularShadow"
            />
          </div>
        </td>
      </tr>
    );
  }
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorPage refetch={() => config?.onFetchRecords?.({})} />
      </div>
    );
  }

  const _width = //{width: '100%'}; // TODO: Uncomment and adjust as needed
    open
      ? {
          width:
            parentType === 'record'
              ? 'calc(100dvw - 635px)'
              : 'calc(100dvw - 264px)',
        }
      : {
          width:
            parentType === 'record'
              ? 'calc(100dvw - 450px)'
              : 'calc(100dvw - 98px)',
        };

  return (
    <GridProvider
      {...gridQueryConfigs}
      current_tab_id={current_tab_id}
      config={{
        ...config,
        columnsOrder: newColumnOrder,
        isInfinite: false,
        columns: newVisibleColumns,
        group_by_initial_columns: initialColumns,
        parentGroupData: [...(parentGroupData ?? []), { ...rowData }],
        onFetchRecords: (data) => {
          fetchData({
            ...data,
            ...gridFilters,
            grouping: groupFields?.[0]?.field
              ? [groupFields[0].field as string]
              : [],
            sorting: newSorting?.length
              ? newSorting
              : gridQueryConfigs?.sorting?.length
                ? gridQueryConfigs?.sorting
                : defaultSorting,
          });
        },
        parentGroupFields: groupFields,
      }}
      parentType="grouping_expansion"
      data={newItems}
      totalCount={totalCount}
      grouping={grouping}
    >
      {/* <div className={cn(`hidden lg:grid`)}> */}
      <GridGroupRows
        rowIndex={rowIndex}
        originalGroups={originalGroups}
        groupLevel={level}
      />
      {/* <MyTableBody 
          parentMeta={metadata?.parentRow}
        /> */}
      <TableRow>
        <td colSpan={newVisibleColumns.length + 1}>
          {!grouping?.length && (
            <CardFooter
              style={
                !isMobile
                  ? _width
                  : {
                      width: 'calc(100dvw - 1rem)',
                      position: 'sticky',
                      left: 0,
                    }
              }
            >
              <Pagination isGroupType={true} />
            </CardFooter>
          )}
        </td>
      </TableRow>
      {/* </div> */}
    </GridProvider>
  );
};

export default GridGroupingExpansion;

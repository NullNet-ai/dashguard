'use client';

import { Button as Button2, Button as HeadlessBtn } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import {
  type GroupingState,
  flexRender,
  // eslint-disable-next-line import/named
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileIcon,
} from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import StatusCell from '~/components/ui/status-cell';
import { useToast } from '~/context/ToastProvider';

import { TooltipProvider } from '~/components/ui/tooltip';
import { formatGroupByResult } from '~/components/platform/Grid/utils/formatGroupByResult';
import { BulkArchive } from './Action/BulkArchive';
import { Create } from './Action/Create';
import { UpdateReportGrouping } from './Action/UpdateReportGrouping';
import { UpdateReportSorting } from './Action/UpdateReportSorting';
import type { IGroupBy } from './Category/type';
import {
  ArchiveComponent,
  DeleteComponent,
  EditComponent,
  RestoreComponent,
} from './DefatultRow/Actions';
import { type ISearchItem } from './Search/types';
import {
  type IAction,
  type IConfigGrid,
  type ICreateContext,
  type IPropsGrid,
  type IState,
  type TActionType,
} from './types';
import { constructSearchableFields } from './utils/constructSearchableFields';
import { sortColumns } from './utils/sortColumns';
import { FetchInfiniteData } from './Action/FetchInfiniteData';
import { isEmpty } from 'lodash';

export const GridContext = React.createContext<ICreateContext>({});

interface IProps extends IPropsGrid {
  children: React.ReactNode;
  config: IConfigGrid;
  data: any;
  totalCount: number;
  parentType?: 'grid' | 'form' | 'field' | 'grid_expansion';
  onRefetch?: (gridData: any) => void;
  gridLevel?: number;
  gridType?: 'card-list' | 'table';
}

export default function GridProvider({
  children,
  totalCount,
  config: _propsConfig,
  data,
  onSelectRecords,
  initialSelectedRecords = {},
  sorting: initialSorting = [],
  defaultSorting,
  advanceFilter = [],
  defaultAdvanceFilter = [],
  pagination,
  parentType,
  gridLevel = 1,
  grouping: initialGrouping = [],
}: IProps) {
  const _defaultSorting = defaultSorting?.length
    ? defaultSorting
    : [
        {
          id: 'created_date',
          desc: true,
        },
      ];

  const resolvedGroupings = useMemo(() => {
    if (!initialGrouping?.length) return [];
    if (typeof initialGrouping[0] === 'string') return initialGrouping;
    return (initialGrouping as IGroupBy[])?.reduce(
      (acc: GroupingState, curr) => {
        return [...acc, curr.value];
      },
      [],
    );
  }, [initialGrouping]) as GroupingState;

  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 728px)' });

  /** @HOOKS */
  const toast = useToast();

  /** @STATES */
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [archiveBulkLoading, setArchiveBulkLoading] = useState<boolean>(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialSelectedRecords,
  );

  const [rowSelectedRecord, setRowSelectedRecord] = useState<any[]>([]);
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const [showArchiveConfirmationModal, setShowArchiveConfirmationModal] =
    useState<boolean>(false);
  const [rowToArchive, setRowToArchive] = useState<Row<any> | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [columnVisibility, setColumnVisibility] = React.useState(() => {
    return {
      ...resolvedGroupings?.reduce((acc: any, curr) => {
        return {
          ...acc,
          [curr]: false,
        };
      }, {}),
    };
  });

  const [sorting, setSorting] = useState<SortingState>(
    initialSorting?.length ? initialSorting : _defaultSorting,
  );
  const [grouping, setGrouping] = React.useState<GroupingState>(
    resolvedGroupings?.length ? resolvedGroupings : [],
  );

  const [showBulkActionConfirmationModal, setShowBulkActionConfirmationModal] =
    useState<boolean | null>(false);
  const [bulkActionType, setBulkActionType] = useState<string | null>(null);
  const [
    playgroundGridIsShowCreateButton,
    setPlaygroundGridIsShowCreateButton,
  ] = useState<string | null>(null);
  const [playgroundGridIsShowRowAction, setPlaygroundGridIsShowRowAction] =
    useState<string | null>(null);

  // infinite data options
  const [infiniteData, setInfiniteData] = useState<any[]>(data);
  const [bufferData, setBufferData] = useState<any[]>([]);
  const [current, setCurrent] = useState(1);
  const [limit, setLimit] = useState<number>(pagination?.limit_per_page ?? 100);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [infiniteCount, setInfiniteCount] = useState(totalCount ?? 0);

  const [gridColumns] = useState<any[]>(
    _propsConfig?.columns?.map((item: any) => {
      return {
        header: item.header,
        accessorKey: item.accessorKey,
        search_config: item.search_config,
        data_type: item.data_type,
      };
    }),
  );
  const resolvedDefaultFilter = defaultAdvanceFilter?.map((filter) => ({
    ...filter,
    default: true,
  })) as ISearchItem[];

  if (!!_propsConfig?.columnsOrder?.length) {
    _propsConfig.columns = sortColumns(
      _propsConfig?.columnsOrder,
      _propsConfig?.columns,
    );
  }

  const resolvedAdvanceFilter = advanceFilter?.reduce(
    (acc, curr) => {
      if (curr?.default) return acc;
      return [...acc, curr];
    },
    [...resolvedDefaultFilter],
  );

  // use effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const createButton = localStorage.getItem(
        'playground_grid_is_show_create_button',
      );
      const rowAction = localStorage.getItem(
        'playground_grid_is_show_row_action',
      );

      setPlaygroundGridIsShowCreateButton(createButton);
      setPlaygroundGridIsShowRowAction(rowAction);
    }
  }, []);

  // use effect for sorting if there is a change in props sorting it should set the sorting
  useEffect(() => {
    if (initialSorting?.length) {
      setSorting(initialSorting);
    }
  }, [initialSorting]);

  useEffect(() => {
    if (JSON.stringify(grouping) !== JSON.stringify(resolvedGroupings)) {
      setGrouping(resolvedGroupings);
      setColumnVisibility((prev) => {
        const newVisibility = { ...prev };
        resolvedGroupings?.forEach((curr) => {
          newVisibility[curr] = false;
        });
        return newVisibility;
      });
    }
  }, [resolvedGroupings]);

  /** DEFAULT GRID CONFIGS */
  const config: IConfigGrid = {
    enableMultiRowSelection: true,
    enableAutoCreate: true,
    enableRowClick: true,
    enableRowExpansion: false,
    enableRowSelection: true,
    enableGridGrouping: true,
    hideCreateButton:
      playgroundGridIsShowCreateButton != null
        ? !(playgroundGridIsShowCreateButton == 'true')
        : false,
    disableDefaultAction:
      playgroundGridIsShowRowAction != null
        ? !(playgroundGridIsShowRowAction == 'true')
        : false,
    searchableFields:
      constructSearchableFields({
        columns: _propsConfig?.columns ?? [],
        entity: _propsConfig?.entity ?? '',
      }) ?? [],
    ..._propsConfig,
  };

  // const newData = isMobileOrTablet && config.isInfinite ? infiniteData : data;
  const newData = useMemo(() => {
    if (grouping.length) {
      const configColumns = config?.group_by_initial_columns || config?.columns;
      const columnConfig = configColumns?.find(
        (col: any) => col.accessorKey === grouping[0],
      ) as any;
      const entity = columnConfig?.search_config?.entity || config.entity;
      const field = columnConfig?.search_config?.field || grouping[0];
      return formatGroupByResult({
        data: data,
        field,
        entity,
      });
    }
    return isMobileOrTablet && config.isInfinite ? infiniteData : data;
  }, [
    grouping,
    isMobileOrTablet,
    config.isInfinite,
    config?.group_by_initial_columns,
    config?.columns,
    config.entity,
    infiniteData,
    data,
  ]);

  const handleSwitchViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
  };

  const handleSingleSelect = async (row: any) => {
    if (!row) {
      toast.error('Row is required');
      return;
    }
    if (onSelectRecords) {
      onSelectRecords([row]);
    }
    setRowSelectedRecord([row]);
  };
  const handleMultiSelect = () => {
    if (!Object.keys(rowSelection).length) {
      toast.error('Row Selected is required');
      return;
    }

    const selectedData = (data as any[])?.filter((item) => {
      return rowSelection[item.id];
    });

    setRowSelectedRecord(selectedData);
  };

  const handleResetSorting = () => {
    setSorting(_defaultSorting);
    handleUpdateReportSorting(_defaultSorting);
  };

  const handleRemoveSorting = (columnId: string) => {
    setSorting((prevSorting) =>
      prevSorting.filter((sort) => sort.id !== columnId),
    );
    const updatedSorting = sorting.filter((sort) => sort.id !== columnId);
    if (parentType === 'form') {
      return config?.onFetchRecords?.({
        sorting: updatedSorting,
      });
    }
    handleUpdateReportSorting(updatedSorting);
  };

  const handleUpdateReportSorting = async (updater: Updater<SortingState>) => {
    const updatedSorting =
      typeof updater === 'function' ? updater(sorting) : updater;

    const processedSortKeys = new Map();

    const resolvedSorting = updatedSorting?.reduce(
      (acc: SortingState, sort) => {
        const sortFields = config?.columns?.find(
          (column: any) => column?.accessorKey === sort.id,
        );

        const resolvedSortFields = Array.isArray(sortFields?.sortKey)
          ? sortFields.sortKey.map((sortKey) => {
              const key = `${sort.id}_${sortKey}`;
              // If we've already processed this combination, skip it
              if (processedSortKeys.has(key)) {
                return null;
              }
              processedSortKeys.set(key, true);
              return {
                ...sort,
                sort_key: sortKey,
              };
            })
          : (() => {
              const key = `${sort.id}_${sortFields?.sortKey || sort.id}`;
              if (processedSortKeys.has(key)) {
                return null;
              }
              processedSortKeys.set(key, true);
              return [
                {
                  ...sort,
                  sort_key: sortFields?.sortKey || sort.id,
                },
              ];
            })();

        return [
          ...acc,
          ...(resolvedSortFields?.filter(Boolean) as SortingState),
        ];
      },
      [],
    );

    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      return config?.onFetchRecords?.({
        sorting: resolvedSorting,
      });
    }
    UpdateReportSorting({ sorting: resolvedSorting });
  };

  const handleAddSorting = (updater: Updater<SortingState>) => {
    setSorting(updater);
    handleUpdateReportSorting(updater);
  };

  const handleUpdateGrouping = async (updater: Updater<GroupingState>) => {
    const newGrouping =
      typeof updater === 'function' ? updater(grouping) : updater;

    // Update column visibility to hide grouped columns
    setColumnVisibility((prev: any) => {
      const visibility: any = { ...prev };
      // Show all previously grouped columns
      grouping.forEach((columnId) => {
        visibility[columnId] = true;
      });
      // Hide newly grouped columns
      newGrouping.forEach((columnId) => {
        visibility[columnId] = false;
      });
      return visibility;
    });
    setGrouping(newGrouping);
    const groupings = newGrouping?.map((item) => {
      const columnConfig = config?.columns?.find(
        (column: any) => column?.accessorKey === item,
      ) as any;
      const label = (columnConfig?.header as string) ?? '';
      const entity = columnConfig?.search_config?.entity || config.entity;
      const field = columnConfig?.search_config?.field || item;
      return {
        value: item,
        field: `${entity}.${field}`,
        label,
      };
    });
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      return config?.onFetchRecords?.({
        grouping: groupings[0]?.field ? [groupings[0]?.field] : [],
      });
    }
    UpdateReportGrouping({ grouping: groupings });
  };

  /** @REFS */
  const selectTableRow = useRef<ColumnDef<any>>({
    id: 'select',
    size: 50,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        className="ml-1 border-foreground"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="ml-1 border-foreground"
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
      />
    ),
    enableSorting: false,
    enableHiding: true,
  });

  const expandTableRow = useRef<ColumnDef<any>>({
    id: 'expand',
    size: 50,
    enableResizing: false,
    header: '',
    cell: ({ row }: any) => (
      <HeadlessBtn onClick={() => row.toggleExpanded()}>
        {row.getIsExpanded() ? (
          <>
            {config?.rowExpansionOptions?.icons?.expandIcon ? (
              config?.rowExpansionOptions?.icons?.expandIcon
            ) : (
              <ChevronDown className="h-6 w-6 text-primary" />
            )}
          </>
        ) : (
          <>
            {config?.rowExpansionOptions?.icons?.collapseIcon ? (
              config?.rowExpansionOptions?.icons?.collapseIcon
            ) : config?.rowExpansionOptions?.expandPosition === 'left' ||
              !config?.rowExpansionOptions?.expandPosition ? (
              <ChevronRight className="h-6 w-6 text-default/40" />
            ) : (
              <ChevronLeft className="h-6 w-6 text-default/40" />
            )}
          </>
        )}
      </HeadlessBtn>
    ),
    enableSorting: false,
    enableHiding: true,
  });

  const actionRow = useRef<ColumnDef<any>>({
    id: 'action',
    size: 1,
    enableResizing: false,
    header: 'Actions',
    cell: ({ row }) => {
      // Check if the row has either 'draft' or desired accessor
      const showActions = [
        'draft',
        'active',
        'Draft',
        'Active',
        'Archived',
        'archived',
      ].includes(row.original?.status);

      if (!showActions) return null;

      const statusesIncluded = config?.statusesIncluded || [];
      const selectedRecords = Object.keys(rowSelection);
      const disableActions =
        selectedRecords.includes(row.original.id) ||
        !statusesIncluded?.includes(row.original?.status);

      const showCustomActionOnly =
        config?.disableDefaultAction && config?.customRowAction;

      if (config?.actionType === 'single-select') {
        return (
          <Button2
            className="mx-auto flex cursor-pointer"
            disabled={disableActions}
            type="button"
            onClick={() => handleSingleSelect(row.original)}
          >
            <PlusCircleIcon
              className={`h-5 w-5 ${disableActions ? 'text-gray-400' : 'text-primary'}`}
            />
          </Button2>
        );
      }

      if (config?.actionType === 'multi-select') {
        return (
          <Button
            className="mx-auto flex"
            disabled={disableActions}
            type="button"
            variant="ghost"
            onClick={() => handleSingleSelect(row.original)}
          >
            <FileIcon className="h-5 w-5 text-primary" />
          </Button>
        );
      }

      if (showCustomActionOnly) {
        return (
          <>
            {config?.customRowAction &&
              config?.customRowAction({
                row,
                config,
              })}
          </>
        );
      }

      return (
        <TooltipProvider>
          <EditComponent row={row} config={config!} />
          {!['Archived', 'Delete'].includes(row.original?.status) && (
            <ArchiveComponent
              config={config!}
              open={showArchiveConfirmationModal}
              record={row}
              row={row}
              setOpen={setShowArchiveConfirmationModal}
              setRecord={setRowToArchive}
            />
          )}
          {row.original?.status === 'Archived' && (
            <>
              <RestoreComponent config={config!} row={row} />
              <DeleteComponent config={config!} row={row} />
            </>
          )}
          {config?.customRowAction &&
            config?.customRowAction({
              row,
              config,
              viewMode,
            })}
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  });

  const groupByColumn = useRef<ColumnDef<any>>({
    id: 'grouping',
    header: 'Group By',
    size: 200,
    enableResizing: false,
    accessorKey: 'value',
  });

  const actionTypeColumnCondition = (
    viewMode: string,
    defaultAdvanceFilter: ISearchItem[],
    actionsType?: TActionType,
  ) => {
    const isDefaultFilterArchived = defaultAdvanceFilter?.find(
      (filter) =>
        filter?.field === 'status' && filter?.values?.[0] === 'Archived',
    );
    const stateIndex = config?.columns?.findIndex(
      (column) => column.header === 'State',
    );
    let columns = config?.columns || [];

    if (isDefaultFilterArchived) {
      const newColumn = {
        header: 'Previous State',
        accessorKey: 'previous_status',
        cell: ({ row }) => {
          const value = row?.original?.previous_status;
          return <StatusCell value={value} />;
        },
      } as ColumnDef<any>;

      if (stateIndex !== -1) {
        columns = [
          ...columns.slice(0, stateIndex + 1),
          newColumn,
          ...columns.slice(stateIndex + 1),
        ];
      } else {
        columns = [...columns, newColumn];
      }
    }

    // Exclude selectTableRow and actionRow if view mode is 'card'
    if (viewMode === 'card') {
      return [...columns];
    }

    switch (actionsType) {
      case 'single-select':
        if (config?.disableDefaultAction) {
          return [...columns];
        }

        return [...columns, actionRow?.current];
      default:
        if (config?.enableGridGrouping && grouping.length && newData.length) {
          const groupColumn = grouping[0] as string;
          const configColumns =
            config?.group_by_initial_columns || config?.columns;
          const columnConfig = configColumns?.find(
            (col: any) => col.accessorKey === groupColumn,
          );
          const column = {
            ...groupByColumn.current,
            cell: ({ row }) => {
              const value = row?.original?.formatted_value;
              if (!value) {
                return null;
              }

              if (columnConfig?.cell) {
                return (
                  <>
                    {columnConfig.cell({
                      row: { original: { [groupColumn]: value } },
                    })}
                    <div className="ml-1 flex items-center">
                      <span className="text-sm font-semibold">{`(${row?.original.count})`}</span>
                    </div>
                  </>
                );
              }

              return (
                <>
                  {flexRender(
                    columnConfig?.cell ??
                      ((props) => <div>{String(props.getValue())}</div>),
                    {
                      row: { original: { [groupColumn]: value } },
                      getValue: () => value,
                    },
                  )}
                  <div className="ml-1 flex items-center">
                    <span className="text-sm font-semibold">{`(${row?.original.count})`}</span>
                  </div>
                </>
              );
            },
          };
          columns = [column, ...columns];
        }
        if (
          (config?.enableGridGrouping && grouping.length) ||
          config?.enableRowExpansion ||
          grouping.length
        ) {
          if (
            isEmpty(config?.rowExpansionOptions) ||
            config?.rowExpansionOptions?.expandPosition === 'left'
          ) {
            columns = [expandTableRow?.current, ...columns];
          } else {
            columns = [...columns, expandTableRow?.current];
          }
        }
        if (config?.enableRowSelection) {
          columns = [selectTableRow?.current, ...columns];
        }
        if (!config?.disableDefaultAction) {
          columns = [...columns, actionRow?.current];
        }

        return columns;
    }
  };

  /** @HOOKS */
  const table = useReactTable({
    data: newData,
    getRowId: (row) => row.id,
    columns: actionTypeColumnCondition(
      viewMode,
      defaultAdvanceFilter,
      config?.actionType,
    ),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    onColumnSizingChange: setColSizing,
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: config?.enableMultiRowSelection,
    enableHiding: true,
    state: {
      sorting,
      grouping,
      columnSizing: colSizing,
      rowSelection,
      columnVisibility: (config?.hideColumnsOnMobile ?? []).reduce(
        (acc, curr) => {
          acc[curr] = !isMobileOrTablet;
          return acc;
        },
        columnVisibility,
      ),
    },
    enableMultiSort: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: handleAddSorting,
    onGroupingChange: handleUpdateGrouping,
    // getGroupedRowModel: getGroupedRowModel(),
    // getExpandedRowModel: getExpandedRowModel(),
    // enableGrouping: true,
  });
  /** @ACTIONS */

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      if (!config?.entity) {
        toast.error('Entity is required');
        setCreateLoading(false);
        return;
      }
      await Create({
        entity: config?.entity,
        defaultValues: config?.defaultValues,
        enableAutoCreate: config?.enableAutoCreate,
        is_from_grid: true,
      });
    } catch (error) {
      console.error('An error occurred while creating a record', error);
      setCreateLoading(false);
    }
  };
  const handleArchiveBulkRecord = async () => {
    try {
      setArchiveBulkLoading(true);
      const selectedRows = table?.getSelectedRowModel().rows;
      if (!selectedRows?.length) return;
      if (config?.archiveBulkRecordCustomAction) {
        config?.archiveBulkRecordCustomAction({
          config,
          selected_rows: selectedRows,
        });
        return;
      }
      const record_ids = selectedRows.map((row) => row?.id);
      await BulkArchive({ entity: config?.entity, record_ids });
      setArchiveBulkLoading(false);
      table?.resetRowSelection();
      setShowBulkActionConfirmationModal(false);
      setBulkActionType(null);
    } catch (error) {
      console.error('An error occurred while creating a record', error);
      setArchiveBulkLoading(false);
    }
  };

  const handleMergeBufferInfinite = React.useMemo(
    () => () => {
      if (!bufferData?.length) {
        return;
      }
      setInfiniteData((prev) => {
        return [...prev, ...bufferData];
      });
      setBufferData([]);
    },
    [bufferData],
  );

  const handleUpdateInfiniteData = async ({
    items,
    totalCount,
    storageType,
    curr,
  }: {
    items: any[];
    totalCount: number;
    storageType: 'buffer' | 'items';
    curr?: number;
  }) => {
    if (storageType === 'buffer') {
      setBufferData(items);
      setCurrent((prev) => {
        return curr ? curr : prev + 1;
      });

      return;
    }
    setInfiniteData((prev) => {
      if (current === 1) {
        return items;
      }
      return [...prev, ...items];
    });
    setCurrent((prev) => {
      return curr ? curr : prev + 1;
    });
    setInfiniteCount(totalCount);
  };

  const infinite_state = {
    current,
    limit,
    page,
    hasMore,
    infiniteData,
    bufferData,
    infiniteCount,
  };

  const infinite_actions = {
    setCurrent,
    setLimit,
    setPage,
    setHasMore,
    setInfiniteData,
    setBufferData,
    setInfiniteCount,
    handleUpdateInfiniteData,
    handleMergeBufferInfinite,
  };

  const state_context = {
    config: {
      ...config,
      columns: [
        selectTableRow?.current,
        actionRow?.current,
        ...(config?.columns ?? []),
      ],
      gridColumns,
    },
    parentType,
    data: newData,
    table,
    selectTableRow,
    totalCount,
    createLoading,
    archiveBulkLoading,
    showArchiveConfirmationModal,
    rowToArchive,
    totalCountSelected: Object.keys(rowSelection ?? {}).length,
    viewMode,
    sorting,
    advanceFilter,
    defaultAdvanceFilter,
    rowSelection,
    showBulkActionConfirmationModal,
    bulkActionType,
    pagination,
    hasMore,
    gridLevel,
    infinite_options: infinite_state,
    initial_columns: config?.columns,
    grouping,
  } as IState;
  const actions = {
    handleCreate,
    handleArchiveBulkRecord,
    handleMultiSelect,
    handleSwitchViewMode,
    handleResetSorting,
    handleRemoveSorting,
    handleAddSorting,
    handleSingleSelect,
    setShowArchiveConfirmationModal,
    setRowToArchive,
    setShowBulkActionConfirmationModal,
    setBulkActionType,
    setHasMore,
    infiniteActions: {
      ...infinite_actions,
    },
  } as IAction;

  return (
    <GridContext.Provider
      value={{
        state: state_context,
        actions,
      }}
    >
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
}

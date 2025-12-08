'use client';

import {
  // eslint-disable-next-line import/named
  getCoreRowModel,
  useReactTable,
  type ColumnSizingState,
  type GroupingState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Updater,
  ExpandedState,
} from '@tanstack/react-table';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { useToast } from '~/context/ToastProvider';

import { formatGroupByResult } from '~/components/platform/Grid/utils/formatGroupByResult';
import { BulkArchive } from './Action/BulkArchive';
import { Create } from './Action/Create';
import { UpdateReportGrouping } from './Action/UpdateReportGrouping';
import { UpdateReportSorting } from './Action/UpdateReportSorting';
import type { IGroupBy } from './Category/type';
import { type ISearchItem } from './Search/types';
import { useActionColumns } from './hooks/actionColumns';
import { useColumnConditions } from './hooks/useColumnConditions';
import {
  type IParentType,
  type IAction,
  type IConfigGrid,
  type ICreateContext,
  type IPropsGrid,
  type IState,
} from './types';
import { constructSearchableFields } from './utils/constructSearchableFields';
import { sortColumns } from './utils/sortColumns';
import { useRouter } from 'next/navigation';
import { formatSortingFields } from './utils/formatSortingFields';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

export const GridContext = React.createContext<ICreateContext>({});

interface IProps extends IPropsGrid {
  children: React.ReactNode;
  config: IConfigGrid;
  data: any;
  totalCount: number;
  parentType?: IParentType;
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
  gridKey,
  customCreateButton,
  customCreateActionButton,
  hideCreateNewFilter,
  defaultGrouping,
  current_tab_id,
}: IProps) {
  const router = useRouter();

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

  const resolvedFieldGroupings = useMemo(() => {
    if (!initialGrouping?.length) return [];
    if (typeof initialGrouping[0] === 'string') return initialGrouping;
    return (initialGrouping as IGroupBy[])?.reduce(
      (acc: GroupingState, curr) => {
        return [...acc, curr.field];
      },
      [],
    );
  }, [initialGrouping]) as GroupingState;

  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 728px)' });

  /** @HOOKS */
  const toast = useToast();

  /** @STATES */
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [actionBulkLoading, setActionBulkLoading] = useState<boolean>(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialSelectedRecords,
  );

  const [rowSelectedRecord, setRowSelectedRecord] = useState<any[]>([]);
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const [showActionConfirmationModal, setShowActionConfirmationModal] =
    useState<boolean>(false);
  const [rowToArchive, setRowToArchive] = useState<Row<any> | null>(null);

  const [viewMode, setViewMode] = useState<'table' | 'card'>(
    _propsConfig?.viewMode ?? 'table',
  );

  const [columnVisibility, setColumnVisibility] = React.useState(() => {
    // First, hide grouped columns
    const initialVisibility = resolvedGroupings?.reduce((acc: any, curr) => {
      return {
        ...acc,
        [curr]: false,
      };
    }, {});

    // Then, also hide columns with is_hidden: true
    const hiddenColumns = _propsConfig?.columns?.reduce(
      (acc: any, column: any) => {
        if (column.is_hidden) {
          return {
            ...acc,
            [column.accessorKey]: false,
          };
        }
        return acc;
      },
      {},
    );

    return {
      ...initialVisibility,
      ...hiddenColumns,
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
  const [columnsOrder, setColumnsOrder] = useState<any[]>(
    _propsConfig?.columnsOrder ?? [],
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [reorderedData, setReorderedData] = useState<any[]>([]);
  const [hasBeenReordered, setHasBeenReordered] = useState(false);

  const [gridColumns, setGridColumns] = useState<any[]>(
    _propsConfig?.columns?.map((item: any) => {
      return {
        ...item,
        header: item.header,
        accessorKey: item.accessorKey,
        search_config: item.search_config,
        data_type: item.data_type,
        sort_config: item.sort_config,
      };
    }),
  );
  const resolvedDefaultFilter = defaultAdvanceFilter?.map((filter) => ({
    ...filter,
    default: true,
  })) as ISearchItem[];

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
    if (grouping?.length) {
      setColumnVisibility(() => {
        const newVisibility: any = {};
        grouping.forEach((curr) => {
          newVisibility[curr] = false;
        });
        return newVisibility;
      });
      if (config?.onFetchRecords && parentType !== 'grouping_expansion') {
        config?.onFetchRecords({
          grouping: resolvedFieldGroupings[0]
            ? [resolvedFieldGroupings[0]]
            : [],
        });
      }
      const { expanded = {} } = getGridPersistenceFromLocalStorage() ?? {};
      setExpanded(expanded);
    }
  }, []);

  // use effect for column order
  useEffect(() => {
    if (!_propsConfig?.columnsOrder?.length) {
      setGridColumns(_propsConfig?.columns ?? []);
      setColumnsOrder([]);
      return;
    }

    if (!!_propsConfig?.columnsOrder?.length) {
      const sortedColumns = sortColumns(
        _propsConfig?.columnsOrder,
        _propsConfig?.columns,
      );
      // _propsConfig.columns = sortedColumns;
      setGridColumns(sortedColumns);
    }

    // Check if arrays have different lengths
    if (columnsOrder.length !== _propsConfig.columnsOrder.length) {
      setColumnsOrder(_propsConfig.columnsOrder ?? []);
      return;
    }

    const hasChanged = _propsConfig.columnsOrder.some((newCol, index) => {
      const currentCol = columnsOrder[index];
      return newCol.id !== currentCol.id || newCol.order !== currentCol.order;
    });

    if (hasChanged) {
      setColumnsOrder(_propsConfig.columnsOrder ?? []);
    }
  }, [_propsConfig?.columnsOrder]);

  // use effect for sorting if there is a change in props sorting it should set the sorting
  useEffect(() => {
    if (initialSorting?.length) {
      setSorting(initialSorting);
      if (parentType === 'grouping_expansion' && !grouping?.length) {
        config?.onFetchRecords?.({
          sorting: initialSorting,
        });
      }
    }
  }, [JSON.stringify(initialSorting)]);

  useEffect(() => {
    if (JSON.stringify(grouping) !== JSON.stringify(resolvedGroupings)) {
      setGrouping(resolvedGroupings);
      setColumnVisibility(() => {
        const newVisibility: any = {};
        resolvedGroupings?.forEach((curr) => {
          newVisibility[curr] = false;
        });
        return newVisibility;
      });
      if (config?.onFetchRecords) {
        config?.onFetchRecords({
          grouping: resolvedFieldGroupings[0]
            ? [resolvedFieldGroupings[0]]
            : [],
        });
      }
    }
  }, [resolvedGroupings]);

  // Reset reordered state when data changes from props
  useEffect(() => {
    if (hasBeenReordered) {
      setHasBeenReordered(false);
      setReorderedData([]);
    }
  }, [data]);

  // Reset reordered state when grouping changes
  useEffect(() => {
    if (hasBeenReordered && grouping.length > 0) {
      setHasBeenReordered(false);
      setReorderedData([]);
    }
  }, [grouping.length]);

  useEffect(() => {
    if (parentType === 'grouping_expansion') {
      config?.onFetchRecords?.({});
    }
  }, [advanceFilter]);

  /** DEFAULT GRID CONFIGS */
  const config: IConfigGrid = {
    enableMultiRowSelection: true,
    enableAutoCreate: true,
    enableRowClick: true,
    enableRowExpansion: false,
    enableRowSelection: true,
    enableGridGrouping: true,
    enableSearch: true,
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

  const columnConfig = useMemo(() => {
    if (!grouping.length) return null;
    const configColumns = config?.group_by_initial_columns || config?.columns;
    return configColumns?.find(
      (col: any) => col.accessorKey === grouping[0],
    ) as any;
  }, [grouping, config?.group_by_initial_columns, config?.columns]);

  const newData = useMemo(() => {
    if (hasBeenReordered && !grouping.length) {
      return reorderedData;
    }

    if (grouping.length && columnConfig) {
      const entity = columnConfig?.search_config?.entity || config.entity;
      const field = columnConfig?.search_config?.field || grouping[0];
      return formatGroupByResult({
        data,
        field,
        entity,
        accessorKey: columnConfig?.accessorKey,
      });
    }
    return isMobileOrTablet && config.isInfinite && !grouping.length
      ? infiniteData
      : data;
  }, [
    grouping,
    columnConfig,
    data,
    isMobileOrTablet,
    config.isInfinite,
    infiniteData,
    reorderedData,
    hasBeenReordered,
  ]);

  useEffect(() => {
      if(config.isInfinite && config.entity ==='timeline')  {
        setInfiniteData(data)
        setCurrent(1)
        setInfiniteCount(totalCount || 0)
        setHasMore(false)
      }
  }, [config.isInfinite, config.entity, advanceFilter])
  

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

    if (onSelectRecords) {
      onSelectRecords(selectedData);
    }

    setRowSelectedRecord(selectedData);
  };

  const handleResetSorting = () => {
    setSorting(_defaultSorting);
    handleUpdateReportSorting(_defaultSorting);
    if (config?.onFetchRecords) {
      return config?.onFetchRecords?.({
        sorting: _defaultSorting,
      });
    }
  };

  const handleRemoveSorting = (columnId: string) => {
    setSorting((prevSorting) =>
      prevSorting.filter((sort) => sort.id !== columnId),
    );
    const updatedSorting = sorting.filter((sort) => sort.id !== columnId);
    handleUpdateReportSorting(updatedSorting);
  };

  const handleUpdateReportSorting = async (updater: Updater<SortingState>) => {
    const updatedSorting =
      typeof updater === 'function' ? updater(sorting) : updater;

    const resolvedSorting = formatSortingFields(
      updatedSorting,
      config?.columns,
    );
    UpdateReportSorting({ sorting: resolvedSorting, gridKey });

    if (config?.onFetchRecords) {
      return config?.onFetchRecords?.({
        sorting: resolvedSorting,
      });
    }
  };

  const handleAddSorting = (updater: Updater<SortingState>) => {
    const filteredSorting = sorting?.reduce((acc, curr) => {
      if (!acc?.find((sort) => sort.id === curr.id)) {
        acc.push(curr);
      }
      return acc;
    }, [] as SortingState);

    if (filteredSorting?.length === 1) {
      const updatedSorting =
      typeof updater === 'function' ? updater(sorting) : updater;
      const lastSorting = [updatedSorting?.[updatedSorting?.length - 1]] as SortingState;
      setSorting(lastSorting);
      handleUpdateReportSorting(lastSorting);
    } else {
      setSorting(updater);
      handleUpdateReportSorting(updater);
    }
  };

  const handleUpdateGrouping = async (updater: Updater<GroupingState>) => {
    const newGrouping =
      typeof updater === 'function' ? updater(grouping) : updater;

    const groupings = newGrouping?.map((item) => {
      const columnConfig = config?.columns?.find(
        (column: any) => column?.accessorKey === item,
      ) as any;
      const label = (columnConfig?.header as string) ?? '';
      const entity = columnConfig?.search_config?.entity || config.entity;
      const field = columnConfig?.search_config?.field || item;
      const sortBy = initialSorting?.find((sort) => sort.id === item)?.desc;
      return {
        value: item,
        field: `${entity}.${field}`,
        label,
        desc: typeof sortBy === 'boolean' ? sortBy : false,
        ...(columnConfig?.sort_config ?? {}),
      };
    });
    UpdateReportGrouping({ grouping: groupings, gridKey });

    if (config?.onFetchRecords) {
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
      config?.onFetchRecords?.({
        grouping: groupings[0]?.field ? [groupings[0]?.field] : [],
      });
      return;
    }
  };

  const handleResetGrouping = () => {
    if (defaultGrouping) {
      UpdateReportGrouping({ grouping: defaultGrouping, gridKey });
      if (config?.onFetchRecords) {
        setColumnVisibility((prev: any) => {
          const visibility: any = { ...prev };
          defaultGrouping.forEach((group) => {
            visibility[group.value] = false;
          });
          return visibility;
        });
        const groupings = defaultGrouping?.map((item) => item.value);
        setGrouping(groupings);
        config?.onFetchRecords?.({
          grouping: defaultGrouping[0]?.field
            ? [defaultGrouping[0]?.field]
            : [],
        });
        return;
      }
    }
  };

  const saveGridPersistenceToLocalStorage = (
    updater: Updater<ExpandedState>,
  ) => {
    const updatedExpanded =
      typeof updater === 'function' ? updater(expanded) : updater;
    setExpanded(updatedExpanded);
    const gridData = {
      expanded: updatedExpanded,
    };
    const key = `grid_persistence_${gridKey ?? config?.entity}_${current_tab_id}${grouping?.length ? `_${grouping[0]}` : ''}`;
    localStorage.setItem(key, JSON.stringify(gridData));
  };

  const getGridPersistenceFromLocalStorage = () => {
    const key = `grid_persistence_${gridKey ?? config?.entity}_${current_tab_id}${grouping?.length ? `_${grouping[0]}` : ''}`;
    const gridData = localStorage.getItem(key);
    if (gridData) {
      const parsedData = JSON.parse(gridData);
      return parsedData;
    }
  };

  /** @HOOKS */
  const { selectTableRow, expandTableRow, actionRow, groupByColumn } =
    useActionColumns(
      {
        ...config,
        columns: gridColumns,
      },
      rowSelection,
      showActionConfirmationModal,
      setShowActionConfirmationModal,
      setRowToArchive,
      handleSingleSelect,
      viewMode,
    );

  const { actionTypeColumnCondition } = useColumnConditions(
    {
      ...config,
      columns: gridColumns,
    },
    grouping,
    newData,
    selectTableRow,
    expandTableRow,
    actionRow,
    groupByColumn,
  );

  const handleCheckboxChange = (updater: Updater<RowSelectionState>) => {
    // Update the internal row selection state
    const newRowSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater;

    setRowSelection(newRowSelection);

    // Get the selected data based on the new selection
    const selectedData = (data as any[])?.filter((item) => {
      return newRowSelection[item.id];
    });

    // Call your custom handler or the provided onSelectRecords
    if (onSelectRecords) {
      onSelectRecords(selectedData);
    }

    // Update the selected record state
    setRowSelectedRecord(selectedData);
  };

  const table = useReactTable({
    data: newData,
    getRowId: (row: any) => row.id,
    columns: actionTypeColumnCondition(
      viewMode,
      defaultAdvanceFilter,
      config?.actionType,
    ),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    onColumnSizingChange: setColSizing,
    onRowSelectionChange: !!_propsConfig?.enableCheckboxOnChange
      ? handleCheckboxChange
      : setRowSelection,
    enableMultiRowSelection: config?.enableMultiRowSelection,
    enableHiding: true,
    state: {
      expanded,
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
    enableGrouping: true,
    onExpandedChange: saveGridPersistenceToLocalStorage,
  });
  /** @ACTIONS */

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      // Get the current data source
      const currentData = hasBeenReordered
        ? reorderedData
        : isMobileOrTablet && config.isInfinite && !grouping.length
          ? infiniteData
          : data;

      // Find the old and new indices
      const oldIndex = currentData.findIndex(
        (item: any) => item.id === active.id,
      );
      const newIndex = currentData.findIndex(
        (item: any) => item.id === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with reordered items
        const newReorderedData = [...currentData];
        const [movedItem] = newReorderedData.splice(oldIndex, 1);
        newReorderedData.splice(newIndex, 0, movedItem);

        // Update the reordered state
        setReorderedData(newReorderedData);
        setHasBeenReordered(true);

        // If using infinite data, also update infinite data
        if (isMobileOrTablet && config.isInfinite && !grouping.length) {
          setInfiniteData(newReorderedData);
        }
      }
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      if (!config?.entity) {
        toast.error('Entity is required');
        setCreateLoading(false);
        return;
      }
      const route = await Create({
        entity: config?.entity,
        defaultValues: config?.defaultValues,
        enableAutoCreate: config?.enableAutoCreate,
        is_from_grid: true,
      });

      if (!config?.enableAutoCreate) {
        router.push(route);
        return;
      }
    } catch (error) {
      console.error('An error occurred while creating a record', error);
      setCreateLoading(false);
    }
  };
  const handleArchiveBulkRecord = async () => {
    try {
      setActionBulkLoading(true);
      const selectedRows = table?.getSelectedRowModel().rows;
      if (!selectedRows?.length) return;
      if (config?.archiveBulkRecordCustomAction) {
        await config?.archiveBulkRecordCustomAction({
          config,
          entity: config?.entity,
          selected_rows: selectedRows,
        });
        setActionBulkLoading(false);
        table?.resetRowSelection();
        setShowBulkActionConfirmationModal(false);
        setBulkActionType(null);
        return;
      }
      const record_ids = selectedRows.map((row) => row?.id);
      await BulkArchive({ entity: config?.entity, record_ids });
      setActionBulkLoading(false);
      table?.resetRowSelection();
      setShowBulkActionConfirmationModal(false);
      setBulkActionType(null);
    } catch (error) {
      console.error('An error occurred while creating a record', error);
      setActionBulkLoading(false);
    }
  };
  const handleCustomBulkAction = async () => {
    try {
      setActionBulkLoading(true);
      const selectedRows = table?.getSelectedRowModel().rows;
      if (!selectedRows?.length) return;
      if (config?.customBulkAction) {
        config?.customBulkAction({
          config,
          entity: config?.entity,
          selected_rows: selectedRows,
        });
        return;
      }
      setActionBulkLoading(false);
      table?.resetRowSelection();
      setShowBulkActionConfirmationModal(false);
      setBulkActionType(null);
    } catch (error) {
      console.error('An error occurred:', error);
      setActionBulkLoading(false);
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
      if (current === 1 && config.entity !== 'timeline') {
        return items;
      }
      const mergeItems = [...prev, ...items]

      return  mergeItems;
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
      gridColumns: _propsConfig?.columns,
    },
    parentType,
    data: newData,
    table,
    selectTableRow,
    totalCount,
    createLoading,
    actionBulkLoading,
    showActionConfirmationModal,
    rowToArchive,
    totalCountSelected: Object.keys(rowSelection ?? {}).length,
    viewMode,
    sorting,
    advanceFilter: advanceFilter?.length ? advanceFilter : defaultAdvanceFilter,
    defaultAdvanceFilter,
    defaultSorting: _defaultSorting,
    rowSelection,
    showBulkActionConfirmationModal,
    bulkActionType,
    pagination,
    hasMore,
    gridLevel,
    infinite_options: infinite_state,
    initial_columns: config?.columns,
    grouping,
    groupConfigs: initialGrouping,
    gridKey,
    customCreateButton,
    customCreateActionButton,
    hideCreateNewFilter,
    defaultGrouping,
    current_tab_id,
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
    setShowActionConfirmationModal,
    setRowToArchive,
    setShowBulkActionConfirmationModal,
    setBulkActionType,
    setHasMore,
    infiniteActions: {
      ...infinite_actions,
    },
    handleUpdateGrouping,
    handleCustomBulkAction,
    setColumnsOrder,
    handleResetGrouping,
  } as IAction;

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <GridContext.Provider
        value={{
          state: state_context,
          actions,
        }}
      >
        {children}
      </GridContext.Provider>
    </DndContext>
  );
}

export function useGrid() {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
}

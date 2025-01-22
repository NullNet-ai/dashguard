"use client";
import {
  type ColumnDef,
  type ColumnSizingState,
  getCoreRowModel,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Updater,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { useToast } from "~/context/ToastProvider";
import {
  type IAction,
  type IConfigGrid,
  type ICreateContext,
  type IPropsGrid,
  type IState,
  type TActionType,
} from "./types";

import { Button as Button2 } from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { FileIcon } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { Button } from "~/components/ui/button";
import { Create } from "./Action/Create";
import StatusCell from "~/components/ui/status-cell";
import { BulkArchive } from "./Action/BulkArchive";
import { UpdateReportSorting } from "./Action/UpdateReportSorting";
import {
  ArchiveComponent,
  DeleteComponent,
  EditComponent,
  RestoreComponent,
} from "./DefatultRow/Actions";
import { ISearchItem } from "./Search/types";
import { constructSearchableFields } from "./utils/constructSearchableFields";

export const GridContext = React.createContext<ICreateContext>({});

interface IProps extends IPropsGrid {
  children: React.ReactNode;
  config: IConfigGrid;
  data: any;
  totalCount: number;
  parentType?: "grid" | "form" | "field";
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
}: IProps) {
  const _defaultSorting = defaultSorting
    ? defaultSorting
    : [
        {
          id: "created_date",
          desc: true,
        },
      ];

  const isMobileOrTablet = useMediaQuery({ query: "(max-width: 728px)" });

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
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [columnVisibility, setColumnVisibility] = React.useState(() => {
    return {};
  });
  const [sorting, setSorting] = useState<SortingState>(
    initialSorting?.length ? initialSorting : _defaultSorting,
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

  const resolvedAdvanceFilter = advanceFilter?.reduce(
    (acc, curr) => {
      if (curr?.default) return acc;
      return [...acc, curr];
    },
    [...defaultAdvanceFilter],
  );

  // use effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      const createButton = localStorage.getItem(
        "playground_grid_is_show_create_button",
      );
      const rowAction = localStorage.getItem(
        "playground_grid_is_show_row_action",
      );

      setPlaygroundGridIsShowCreateButton(createButton);
      setPlaygroundGridIsShowRowAction(rowAction);
    }
  }, []);

  /** DEFAULT GRID CONFIGS */
  const config: IConfigGrid = {
    enableMultiRowSelection: true,
    enableAutoCreate: true,
    enableRowClick: true,
    hideCreateButton:
      playgroundGridIsShowCreateButton != null
        ? !(playgroundGridIsShowCreateButton == "true")
        : false,
    disableDefaultAction:
      playgroundGridIsShowRowAction != null
        ? !(playgroundGridIsShowRowAction == "true")
        : false,
    searchableFields:
      constructSearchableFields({
        columns: _propsConfig?.columns ?? [],
        entity: _propsConfig?.entity ?? "",
      }) ?? [],
    ..._propsConfig,
  };

  const handleSwitchViewMode = (mode: "table" | "card") => {
    setViewMode(mode);
  };

  const handleSingleSelect = async (row: any) => {
    if (!row) {
      toast.error("Row is required");
      return;
    }
    setRowSelectedRecord([row]);
  };
  const handleMultiSelect = () => {
    if (!Object.keys(rowSelection).length) {
      toast.error("Row Selected is required");
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
    if(parentType === 'form') {
      return config?.onFetchRecords?.({
        sort: updatedSorting,
      })
    }
    handleUpdateReportSorting(updatedSorting);
  };

  const handleUpdateReportSorting = async (updater: Updater<SortingState>) => {
    const _sorting = typeof updater === "function" ? updater(sorting) : updater;
    const resolvedSorting = _sorting?.map((sort) => {
      const sort_key =
        config?.columns?.find((column: any) => column?.accessorKey === sort.id)
          ?.sortKey || sort.id;
      return {
        ...sort,
        sort_key,
      };
    });

    if(parentType === 'form') {
      return config?.onFetchRecords?.({
        sort: resolvedSorting,
      })
    }
    UpdateReportSorting({ sorting: resolvedSorting });
  };

  const handleAddSorting = (updater: Updater<SortingState>) => {
    setSorting(updater);
    handleUpdateReportSorting(updater);
  };

  /** @REFS */
  const selectTableRow = useRef<ColumnDef<any>>({
    id: "select",
    size: 50,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="border-foreground"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border-foreground"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: true,
  });

  const actionRow = useRef<ColumnDef<any>>({
    id: "action",
    size: 1,
    enableResizing: false,
    header: "Actions",
    cell: ({ row }) => {
      // Check if the row has either 'draft' or desired accessor
      const showActions = [
        "draft",
        "active",
        "Draft",
        "Active",
        "Archived",
        "archived",
      ].includes(row.original?.status);

      if (!showActions) return null;

      const statusesIncluded = config?.statusesIncluded || [];
      const selectedRecords = Object.keys(rowSelection);
      const disableActions =
        selectedRecords.includes(row.original.id) ||
        !statusesIncluded?.includes(row.original?.status);

      if (config?.actionType === "single-select") {
        return (
          <Button2
            disabled={disableActions}
            className="mx-auto flex cursor-pointer"
            type="button"
            onClick={() => handleSingleSelect(row.original)}
          >
            <PlusCircleIcon
              className={`h-5 w-5 ${disableActions ? "text-gray-400" : "text-primary"}`}
            />
          </Button2>
        );
      }

      if (config?.actionType === "multi-select") {
        return (
          <Button
            disabled={disableActions}
            className="mx-auto flex"
            variant={"ghost"}
            type="button"
            onClick={() => handleSingleSelect(row.original)}
          >
            <FileIcon className="h-5 w-5 text-primary" />
          </Button>
        );
      }

      return (
        <>
          <EditComponent row={row} config={config!} />
          {!["Archived", "Delete"].includes(row.original?.status) && (
            <ArchiveComponent
              row={row}
              config={config!}
              open={showArchiveConfirmationModal}
              setOpen={setShowArchiveConfirmationModal}
              record={row}
              setRecord={setRowToArchive}
            />
          )}
          {row.original?.status === "Archived" && (
            <>
              <RestoreComponent row={row} config={config!} />
              <DeleteComponent row={row} config={config!} />
            </>
          )}
        </>
      );
    },
    enableSorting: false,
    enableHiding: true,
  });

  const actionTypeColumnCondition = (
    actionsType: TActionType,
    viewMode: string,
    defaultAdvanceFilter: ISearchItem[],
  ) => {
    const isDefaultFilterArchived = defaultAdvanceFilter?.find(
      (filter) =>
        filter?.field === "status" && filter?.values?.[0] === "Archived",
    );
    const stateIndex = config?.columns?.findIndex(
      (column) => column.header === "State",
    );
    let columns = config?.columns || [];

    if (isDefaultFilterArchived) {
      const newColumn = {
        header: "Previous State",
        accessorKey: "previous_status",
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
    if (viewMode === "card") {
      return [...columns];
    }

    switch (actionsType) {
      case "single-select":
        if (config?.disableDefaultAction) {
          return [...columns];
        }

        return [...columns, actionRow?.current];
      case "default":
        if (config?.disableDefaultAction) {
          return [selectTableRow?.current, ...columns];
        }
        return [selectTableRow?.current, ...columns, actionRow?.current];

      default:
        if (config?.disableDefaultAction) {
          return [selectTableRow?.current, ...columns];
        }

        return [selectTableRow?.current, ...columns, actionRow?.current];
    }
  };

  /** @HOOKS */
  const table = useReactTable({
    data,
    getRowId: (row) => row.id,
    columns: actionTypeColumnCondition(
      config?.actionType || "default",
      viewMode,
      defaultAdvanceFilter,
    ),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    onColumnSizingChange: setColSizing,
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: config?.enableMultiRowSelection,
    enableHiding: true,
    state: {
      sorting,
      columnSizing: colSizing,
      rowSelection,
      columnVisibility: config?.hideColumnsOnMobile?.reduce((acc, curr) => {
        // @ts-expect-error - No need to check for acc
        acc[curr] = !isMobileOrTablet;
        return acc;
      }, columnVisibility),
    },
    enableMultiSort: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: handleAddSorting,
  });

  /** @ACTIONS */
  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      if (!config?.entity) {
        toast.error("Entity is required");
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
      console.error("An error occurred while creating a record", error);
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
      console.error("An error occurred while creating a record", error);
      setArchiveBulkLoading(false);
    }
  };

  useEffect(() => {
    if (!onSelectRecords) return;
    if (rowSelectedRecord?.length === 0) return;
    onSelectRecords(rowSelectedRecord);
  }, [onSelectRecords, rowSelectedRecord]);

  const state_context = {
    config: {
      ...config,
      columns: [
        selectTableRow?.current,
        ...config?.columns,
        actionRow?.current,
      ],
    },
    parentType,
    data,
    table,
    selectTableRow,
    totalCount: totalCount,
    createLoading,
    archiveBulkLoading,
    showArchiveConfirmationModal,
    rowToArchive,
    totalCountSelected: Object.keys(rowSelection ?? {}).length,
    viewMode,
    sorting,
    advanceFilter: resolvedAdvanceFilter,
    defaultAdvanceFilter,
    rowSelection,
    showBulkActionConfirmationModal,
    bulkActionType,
    pagination,
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
  } as IAction;

  return (
    <GridContext.Provider
      value={{
        state: state_context,
        actions: actions,
      }}
    >
      {children}
    </GridContext.Provider>
  );
}

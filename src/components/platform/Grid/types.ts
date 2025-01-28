/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
  OnChangeFn,
  RowSelectionState,
  SortingState,
  type ColumnDef,
  type Row,
  type Table,
} from "@tanstack/react-table";
import { ISearchItem, ISearchParams } from "./Search/types";
import { appRouter } from "../../../server/api/root";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DefaultRowActions {
  row: Row<any>;
  config: IConfigGrid;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  setRecord?: (record: any) => void;
  record?: any;
  viewMode?: "table" | "card";
}

export interface DefaultBulkActions {
  config: IConfigGrid;
  selected_rows: Row<any>[];
}

export type TActionType =
  | "single-select"
  | "multi-select"
  | "default"
  | "custom";

export type TLayerType = "main" | "sub";

export type AppRouterKeys = keyof typeof appRouter;

export type TArchiveType = "warning" | "archive";

type CustomColumnDef<TData> = ColumnDef<TData> & {
  sortKey?: string;
};

export interface IConfigGrid {
  entity: string;
  title?: string;
  columns: CustomColumnDef<any>[];
  hideColumnsOnMobile?: string[];
  actionType?: TActionType;
  statusesIncluded?: string[];
  disableDefaultAction?: boolean;
  disableArchiveButton?: boolean;
  editCustomComponent?: React.FC<any>;
  deleteCustomComponent?: React.FC<any>;
  archiveCustomComponent?: React.FC<any>;
  restoreCustomComponent?: React.FC<any>;
  archiveDialogCustomComponent?: React.FC<any>;
  defaultValues?: Record<string, any>;
  editCustomAction?: (args: DefaultRowActions) => void;
  deleteCustomAction?: (args: DefaultRowActions) => void;
  archiveCustomAction?: (
    args: Record<string, any>,
  ) => void | Promise<void | string | Record<string, any>>;
  restoreCustomAction?: (args: DefaultRowActions) => void;
  archiveBulkRecordCustomAction?: (args: DefaultBulkActions) => void;
  layer?: TLayerType;
  enableAutoCreate?: boolean;
  enableMultiRowSelection?: boolean;
  enableRowClick?: boolean;
  rowClickCustomAction?: (args: DefaultRowActions) => void;
  onFetchRecords?: (args: any) => void;
  searchableFields?: any[];
  is_warning_archive?: boolean;
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: ISearchParams;
  };
  hideCreateButton?: boolean;
}

interface IRowToArchive extends Row<any> {
  shouldDisplayArchiveWarningPrompt?: boolean;
}

export interface IState {
  config: IConfigGrid;
  data: any;
  table: Table<any>;
  totalCount: number;
  selectTableRow: React.MutableRefObject<ColumnDef<any>>;
  createLoading?: boolean;
  totalCountSelected?: number;
  archiveBulkLoading?: boolean;
  showArchiveConfirmationModal: boolean;
  rowToArchive: IRowToArchive;
  viewMode?: "table" | "card";
  sorting?: SortingState;
  rowSelection: RowSelectionState;
  advanceFilter?: ISearchItem[];
  bulkActionType: "archive" | null;
  showBulkActionConfirmationModal: boolean;
  pagination?: IPagination;
  defaultAdvanceFilter?: ISearchItem[];
  parentType?: "grid" | "form" | "field";
}

export interface IAction {
  handleCreate: () => void;
  handleMultiSelect: () => void;
  handleArchiveBulkRecord: () => void;
  handleSwitchViewMode: (mode: "table" | "card") => void;
  handleResetSorting: () => void;
  handleRemoveSorting: (id: string) => void;
  handleAddSorting: OnChangeFn<SortingState>;
  handleSingleSelect: (row: any) => void;
  setShowArchiveConfirmationModal: (show: boolean) => void;
  setRowToArchive: React.Dispatch<any>;
  setBulkActionType: (type: string | null) => void;
  setShowBulkActionConfirmationModal: (show: boolean) => void;
}

export interface ICreateContext {
  state?: IState;
  actions?: IAction;
}

export interface IPagination {
 current_page: number;
 limit_per_page: number;
}

export interface IPropsGrid {
  config: IConfigGrid;
  data: any;
  totalCount: number;
  sorting?: SortingState;
  pagination?: IPagination;
  onSelectRecords?: (rows: any[]) => void;
  initialSelectedRecords?: RowSelectionState;
  defaultSorting?: SortingState;
  defaultAdvanceFilter?: ISearchItem[];
  advanceFilter?: ISearchItem[];
}

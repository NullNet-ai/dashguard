/* eslint-disable @typescript-eslint/no-empty-object-type */

import { OnChangeFn, RowSelectionState, SortingState, type ColumnDef, type Row, type Table } from "@tanstack/react-table";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DefaultRowActions {
  row: Row<any>;
  config: IConfigGrid;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  setRecord?: (record: any) => void;
  record?: any;
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

export interface IConfigGrid {
  entity: string;
  title?: string;
  columns: ColumnDef<any>[];
  hideColumnsOnMobile?: string[];
  actionType?: TActionType;
  statusesIncluded?: string[];
  disableDefaultAction?: boolean;
  editCustomComponent?: React.FC<any>;
  deleteCustomComponent?: React.FC<any>;
  archiveCustomComponent?: React.FC<any>;
  restoreCustomComponent?: React.FC<any>;
  defaultValues?: Record<string, any>;
  editCustomAction?: (args: DefaultRowActions) => void;
  deleteCustomAction?: (args: DefaultRowActions) => void;
  archiveCustomAction?: (args: Record<string, any>) => void | Promise<void>;
  restoreCustomAction?: (args: DefaultRowActions) => void;
  archiveBulkRecordCustomAction?: (args: DefaultBulkActions) => void;
  layer?: TLayerType
  enableAutoCreate?: boolean;
  enableMultiRowSelection?: boolean;
  enableRowClick?: boolean;
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
  rowToArchive: Row<any>;
  viewMode?: 'table' | 'card';
  sorting?: SortingState
  rowSelection: RowSelectionState;
}

export interface IAction {
  handleCreate: () => void;
  handleMultiSelect: () => void;
  handleArchiveBulkRecord: () => void;
  handleSwitchViewMode: (mode: 'table' | 'card') => void;
  handleResetSorting: () => void
  handleRemoveSorting: (id: string) => void
  handleAddSorting: OnChangeFn<SortingState>
  handleSingleSelect: (row: any) => void;
  setShowArchiveConfirmationModal: (show: boolean) => void;
  setRowToArchive: React.Dispatch<any>
  handleCustomArchiveAction: (args: DefaultRowActions) => void;
}

export interface ICreateContext {
  state?: IState;
  actions?: IAction;
  config: any;
}

export interface IPropsGrid {
  config: IConfigGrid;
  data: any;
  totalCount: number;
  sorting?: SortingState;
  onSelectRecords?: (rows: any[]) => void;
  initialSelectedRecords?: RowSelectionState;
  defaultSorting?: SortingState;
}

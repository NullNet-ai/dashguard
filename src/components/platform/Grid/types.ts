/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type ColumnDef,
  type Row,
  type Table,
  GroupingState,
} from '@tanstack/react-table';
import { type ReactElement } from 'react';

import { type appRouter } from '../../../server/api/root';

import { type ISearchItem, type ISearchParams } from './Search/types';
import { IGroupBy } from './Category/type';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DefaultRowActions {
  row: Row<any>;
  config: IConfigGrid;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  setRecord?: (record: any) => void;
  record?: any;
  viewMode?: 'table' | 'card';
}

export interface DefaultBulkActions {
  config: IConfigGrid;
  selected_rows: Row<any>[];
}

export type TActionType =
  | 'single-select'
  | 'multi-select'
  | 'default'
  | 'custom';
  
export type TRowActionType =
  | 'edit'
  | 'delete'
  | 'archive'
  | 'restore'

export type TLayerType = 'main' | 'sub';

export type AppRouterKeys = keyof typeof appRouter;

export type TArchiveType = 'warning' | 'archive';

type CustomColumnDef<TData> = ColumnDef<TData> & {
  sortKey?: string | Array<string>;
};
interface IActionConditionItem {
  accessor: string;
  value: Array<null | string | number | boolean>;
}

export interface IRowExpansionOptions{
  expandPosition?: 'left' | 'right';
  rowExpansionComponent?: ReactElement | ((rowData: any) => JSX.Element);
  icons ?: {
    expandIcon?: ReactElement | React.ComponentType<any> | ((rowData: any) => JSX.Element);
    collapseIcon?: ReactElement | React.ComponentType<any> | ((rowData: any) => JSX.Element);
  } 
}

export interface IActionCondition {
  match_condition: 'match_all' | 'match_any';
  conditions: IActionConditionItem[];
}

export type TActionUIState = 'disabled' | 'hidden';
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
  defaultShownColumns?: string[];
  statusColumn?: string;
  editCustomAction?: (args: DefaultRowActions) => void;
  deleteCustomAction?: (args: DefaultRowActions) => void;
  archiveCustomAction?: (
    args: Record<string, any>, 
  ) => void | Promise<string | Record<string, any>>;
  restoreCustomAction?: (args: DefaultRowActions) => void;
  archiveBulkRecordCustomAction?: (args: DefaultBulkActions) => void;
  layer?: TLayerType;
  enableAutoCreate?: boolean;
  // toggle for single and multi select
  enableMultiRowSelection?: boolean;
  enableRowClick?: boolean;
  rowClickCustomAction?: (args: DefaultRowActions) => void;
  onFetchRecords?: (args: any) => void;
  searchableFields?: any[];
  rowExpansionOptions?: IRowExpansionOptions
  is_warning_archive?: boolean;
  infiniteConfig?: {
    router: AppRouterKeys,
    resolver?: string;
    query_params?: ISearchParams;
  }
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: ISearchParams;
  };
  hideCreateButton?: boolean;
  enableRowExpansion?: boolean;
  viewMode?: 'table' | 'card';
  // for custom row expansion component
  rowExpansionBuilder?: ReactElement | ((rowData: any, viewMode?:  string) => JSX.Element);
  // to hide/show checkbox
  enableRowSelection?: boolean;
  // to identify if grid is a child grid
  isChildGrid?: boolean;
  expandTriggerPosition?: 'left' | 'right';
  columnsOrder?: Record<string,any>[];
  paginationType?: 'default' | 'centered' |'simple-card';
  rowActions?: {
    [R in TRowActionType]?: {
      state?: {
        [A in TActionUIState]?: IActionCondition;
      };
      //TODO: apply to all row actions
      config?: {
        icon?: string;
        tooltip?: string;
      };
    };
  };
  customRowAction?: React.FC<any>;
  isInfinite?: boolean
  additionalData?: Record<string, any>;
  gridColumns? : Record<string,any>[];
  group_by_initial_columns?: CustomColumnDef<any>[];
  parentGroupData?: Record<string, any>[];
  new_button_action?: () => void;
  new_button_title?: string;
  enableGridGrouping?: boolean;
  parentGroupFields?: IGroupBy[];
  dimentionOptions?: {
    gridStartPosition?: number;
    gridEndPosition?: number;
    minHeight?: number;
    summaryWidth?: number;
  }
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
  statusColumn?: string;
  defaultShownColumns?: string[];
  rowToArchive: IRowToArchive;
  viewMode?: 'table' | 'card';
  sorting?: SortingState;
  rowSelection: RowSelectionState;
  advanceFilter?: ISearchItem[];
  bulkActionType: 'archive' | null;
  showBulkActionConfirmationModal: boolean;
  pagination?: IPagination;
  defaultAdvanceFilter?: ISearchItem[];
  parentType?: 'grid' | 'form' | 'field' | 'grid_expansion';
  hasMore?: boolean;
  gridLevel?: number;
  infinite_options?: {
    page: number;
    limit: number;
    current: number;
    hasMore ?: boolean;
    infiniteData ?: any[];
    infiniteCount?: number;
    bufferData?: any[];
  },
  initial_columns: CustomColumnDef<any>[];
  grouping?: GroupingState;
  groupConfigs?: IGroupBy[];
  
}

export interface IAction {
  handleCreate: () => Promise<void>;
  handleMultiSelect: () => void;
  handleArchiveBulkRecord: () => Promise<void>;
  handleSwitchViewMode: (mode: 'table' | 'card') => void;
  handleResetSorting: () => void;
  handleRemoveSorting: (id: string) => void;
  handleAddSorting: OnChangeFn<SortingState>;
  handleSingleSelect: (row: any) => Promise<void>;
  setShowArchiveConfirmationModal: (show: boolean) => void;
  setRowToArchive: React.Dispatch<any>;
  setBulkActionType: (type: string | null) => void;
  setShowBulkActionConfirmationModal: (show: boolean) => void;
  setHasMore: React.Dispatch<any>;
  infiniteActions ?: {
    setCurrent: React.Dispatch<any>;
    setLimit: React.Dispatch<any>;
    setPage: React.Dispatch<any>;
    setHasMore: React.Dispatch<any>;
    setInfiniteData: React.Dispatch<any>;
    handleUpdateInfiniteData : (args?: any) => Promise<void>;
    handleMergeBufferInfinite?: () => void;
  }
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
  parentExpanded?: IExpandedRow[];
  parentType?: 'grid' | 'form' | 'field' | 'grid_expansion' | 'record';
  grouping?: IGroupBy[] | GroupingState;
  customCreateButton?: React.ReactNode | ReactElement
}

export interface IExpandedRow {
  id: string;
  level: number;
}

export interface IExpansionComponentProps {
  rowData?: Record<string, any>;
  viewMode?: 'table' | 'card'
  parentExpanded?: IExpandedRow[];
  grouping?: GroupingState;
}

export interface IGridGroupingExpansionProps {
  config: IConfigGrid;
  rowData: Record<string, any>;
  initialColumns: CustomColumnDef<any>[];
  grouping?: GroupingState;
  visibleColumns: CustomColumnDef<any>[];
  parentGroupData?: Record<string, any>[];
  gridState?: IState;
  parentGroupFields?: IGroupBy[];
}

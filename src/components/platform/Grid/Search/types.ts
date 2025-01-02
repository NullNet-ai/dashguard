/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface IState {
  open: boolean;
  searchItems: ISearchItem[];
  query: string;
  advanceFilterItems: ISearchItem[];
}

export interface IAction {
  handleQuery: (data: React.SetStateAction<string>) => void;
  handleOpen: (open: boolean) => void;
  handleSearchQuery: (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => ISearchResult | undefined;
  handleAddSearchItem: (filterItem: ISearchItemResult) => void;
  handleRemoveSearchItem: (filterItem: ISearchItem) => void;
}

export interface ICreateContext {
  state?: IState;
  actions?: IAction;
}

export interface ISearchParams {
  entity: string;
  pluck?: any;
  pluck_object?: any;
  current?: number;
  limit?: number;
  advance_filters?: {
    type: string;
    values?: string[];
    field?: string;
    operator: string;
    entity?: string;
  }[];
  sorting?: any[];
}

export interface ISearchResult {
  totalCount: number;
  items: Record<string, any>[];
  currentPage: number;
  totalPages: number;
}

export interface ISearchItem {
  type: string;
  operator: string;
  entity: string;
  id?: string;
  values?: string[];
  field?: string;
  label?: string;
  default?: boolean;
  display_value?: string;
}

export interface ISearchItemResult extends ISearchItem {
  count: number
}

export interface ISearchableField {
  field: string;
  label: string;
  operator?: string;
  entity?: string;
}


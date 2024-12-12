export interface IRawFilter {
  id: string;
  type: "criteria" | "operator";
  field: string;
  operator: string;
  values: string[] | string;
}

export enum EOrderDirection {
  DESC = "desc",
  ASC = "asc",
  DESCENDING = "descending",
  ASCENDING = "ascending",
}

export interface IConvertedFilter {
  field_label: string;
  operator_label: string;
  values: string[];
}

export interface IFilterBy {
  filter_id: string;
  filter_by: {
    raw: IRawFilter[];
    converted: IConvertedFilter[];
  };
  sort_by?: ISortBy | null;
}

export interface ISortBy {
  sort_by_field: string;
  sort_by_direction: EOrderDirection;
}

export interface IStoreUnSaveSorts {
  entity: string;
  dirty: boolean;
  validated: boolean;
  values: ISortBy;
}

export interface IStoreUnSaveFilters {
  entity: string;
  dirty: boolean;
  validated: boolean;
  values: IRawFilter[];
}

export interface IState {
  filter_state: IFilterBy;
  storeUnsaved: {
    filters: IStoreUnSaveFilters;
    sorts: IStoreUnSaveSorts;
  };
}
export interface IAction {
  handleStoreUnSavedFilters: (
    entity: string,
    validate: boolean,
    filters: IRawFilter[],
  ) => void;
  handleStoreUnSavedSorts: (
    entity: string,
    validate: boolean,
    sorts: ISortBy,
  ) => void;
}

export interface ICreateContext {
  state?: IState;
  action?: IAction;
}

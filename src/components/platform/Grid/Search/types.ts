/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface IState {
  recentView: (Record<string, unknown> | undefined)[];
  data: Record<string, unknown>[];
  open: boolean;
  searchSelected: Record<string, unknown>[];
}

export interface IAction {
  handleQuery: (data: React.SetStateAction<string>) => void;
  handleOpen: (open: boolean) => void;
  handleSearchSelected: (data: Record<string, unknown>) => void;
}

export interface ICreateContext {
  state?: IState;
  actions?: IAction;
}

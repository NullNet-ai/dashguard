export interface SearchItem {
  id: string;
  name: string;
  value: string;
}


export interface IState {
  filters: string[];
  query: string;
}

export interface IAction {
  addFilter: (filter: string) => void;
  handleOnChange: (e: any) => void;
}

export interface ISearchContext {
  state?: IState;
  actions?: IAction;
}


export interface IProps {
  children: React.ReactNode;
}
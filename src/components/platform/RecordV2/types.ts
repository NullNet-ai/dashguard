import { type PropsWithChildren } from "react";

export interface IMenuOptionConfig {
  label: string;
  onClick: (recordId: string, entityName: string) => void;
  children: IMenuOptionConfig[];
}

export interface RecordProps extends PropsWithChildren {
  test?: any;
}

export interface RecordContextProps {
  state?: ConfigProps;
  action?: unknown;
}

export interface ITabs {
  id: string;
  name: string;
  tabName: string;
}
export interface ConfigProps {
  entityCode: string;
  entityName?: string;
  tabs?: ITabs[];
  identifierOption?: (...args: any) => React.ReactNode;
  categories?: string[];
  recordId?: string;
}
export interface RecordProps extends PropsWithChildren {
  config: ConfigProps;
}

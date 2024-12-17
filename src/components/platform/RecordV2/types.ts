import { type PropsWithChildren } from "react";

export interface IMenuOptionConfig {
  label: string;
  onClick: (recordId: string, entityName: string, ...args: any[]) => void;
  children?: IMenuOptionConfig[];
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
  // identifierOption?: (...args: any) => React.ReactNode;
  identifierOption?: IMenuOptionConfig[];
  categories?: string[];
  recordId?: string;
}
export interface RecordProps extends PropsWithChildren {
  config: ConfigProps;
}

export interface IPlatformRecordLayoutProps { 
  record: React.ReactNode;
  record_summary: React.ReactNode;
  children: React.ReactNode;
}

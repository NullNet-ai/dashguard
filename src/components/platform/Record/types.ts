import { type PropsWithChildren } from "react";


export interface RecordProps extends PropsWithChildren {
  params: {
    code: string;
  }
  // config: {
  //   tabs: ReactNode;
  //   entityCode: string;
  //   entityName?: string;
  // };
}

export interface RecordContextProps{
    state?:  ConfigProps
    action?: unknown
  }
  export interface ConfigProps {
  entityCode:string;
  entityName?:string;
  }
  export interface RecordProps extends PropsWithChildren {
    config: ConfigProps;
  }
  
  
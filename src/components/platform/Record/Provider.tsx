
'use client'
import { createContext} from "react";
import { type RecordContextProps, type RecordProps } from "./types";

export const RecordContext = createContext<RecordContextProps>({});


export default function RecordProvider({ children, config }:RecordProps) {
const { entityCode, entityName } = config;


  const state_context = {
    entityName,
    entityCode,
  } as const ;
  
  
    return (
    <RecordContext.Provider value={{ state:state_context }}>
      {children}
    </RecordContext.Provider>
  );
}

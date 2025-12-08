/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { createContext, useContext, useEffect } from "react";
import { type RecordContextProps, type RecordProps } from "./types";
import { usePathname, useRouter } from "next/navigation";

export const RecordContext = createContext<RecordContextProps>({});

export default function RecordProvider({ children, config }: RecordProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { entityCode, entityName, categories, recordDetails = {}} = config;

  useEffect(() => {
    if (categories?.length) {
      router.replace(`${pathname}?categories=${categories.join(",")}`);
    }
  }, []);

  const state_context = {
    entityName,
    entityCode,
    identifierOption: config?.identifierOption,
    recordDetails,
    config,
    enableTimeline: config?.enableTimeline,
    metadata: config?.metadata,
  } as const;

  return (
    <RecordContext.Provider value={{ state: state_context }}>
      {children}
    </RecordContext.Provider>
  );
}

export const useRecord = (): RecordContextProps => {
  const context = useContext(RecordContext);
  
  if (!context) {
    throw new Error('useRecord must be used within a RecordProvider');
  }
  
  return context;
};

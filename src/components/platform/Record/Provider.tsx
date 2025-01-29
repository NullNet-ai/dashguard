/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { createContext, useEffect } from "react";
import { type RecordContextProps, type RecordProps } from "./types";
import { usePathname, useRouter } from "next/navigation";

export const RecordContext = createContext<RecordContextProps>({});

export default function RecordProvider({ children, config }: RecordProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { entityCode, entityName, categories } = config;

  useEffect(() => {
    if (categories?.length) {
      router.replace(`${pathname}?categories=${categories.join(",")}`);
    }
  }, []);

  const state_context = {
    entityName,
    entityCode,
    identifierOption: config?.identifierOption,
  } as const;

  return (
    <RecordContext.Provider value={{ state: state_context }}>
      {children}
    </RecordContext.Provider>
  );
}

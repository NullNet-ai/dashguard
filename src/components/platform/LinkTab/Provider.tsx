"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { LinkTabContextType } from "./types";
import { useRouter, useSearchParams } from "next/navigation";

const LinkTabContext = createContext<LinkTabContextType | undefined>(undefined);

export function LinkTabProvider({
  children,
  value,
  defaultHref,
}: {
  children: ReactNode;
  value: LinkTabContextType;
  defaultHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (defaultHref) {
      const defaultRoute = value?.tabs.find((tab) => tab.href === defaultHref);
      if (defaultRoute) {
        router.replace(defaultRoute.href);
      }
    }
  }, [defaultHref, searchParams]);
  return (
    <LinkTabContext.Provider value={value}>{children}</LinkTabContext.Provider>
  );
}

export function useLinkTab() {
  const context = useContext(LinkTabContext);
  if (!context) {
    throw new Error("useLinkTab must be used within LinkTabProvider");
  }
  return context;
}

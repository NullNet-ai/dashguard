"use client";

import React, { createContext, useContext, type ReactNode } from "react";

import { type LinkTabContextType } from "./types";

const LinkTabContext = createContext<LinkTabContextType | undefined>(undefined);

export function LinkTabProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: LinkTabContextType;
}) {
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

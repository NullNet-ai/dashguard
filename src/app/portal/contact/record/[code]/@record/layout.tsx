"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

import { ILayoutProps } from "./types";
import ComingSoon from "../../_components/coming_soon";
const Layout = (props: ILayoutProps) => {
  const searchParams = useSearchParams();
  const slot = props[searchParams.get("current_tab") ?? "dashboard"];
  if (!slot) return <ComingSoon />;
  return <div>{slot}</div>;
};

export default Layout;

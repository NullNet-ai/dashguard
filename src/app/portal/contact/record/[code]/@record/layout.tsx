"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

import { type ILayoutProps } from "./types";
import ComingSoon from "../../_components/coming_soon";
const Layout: React.FC<ILayoutProps> = (props) => {
  const searchParams = useSearchParams();
  const slot = props[searchParams.get("current_tab") ?? "dashboard"];
  if (!slot) return <ComingSoon />;
  return <div>{slot}</div>;
};

export default Layout;

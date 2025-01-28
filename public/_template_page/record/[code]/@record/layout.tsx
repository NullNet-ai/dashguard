"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import type { ILayoutProps } from "./types";
import ComingSoon from "../../_components/coming_soon";
import RecordImplementationGuide from "../../../_components/record_guideline";
const Layout = (props: ILayoutProps) => {
  const searchParams = useSearchParams();
  const slot = props[searchParams.get("current_tab") ?? "dashboard"];
  if (!slot)
    return (
      <div>
        <RecordImplementationGuide />
        <ComingSoon />
      </div>
    );
  return <div>{slot}</div>;
};
export default Layout;

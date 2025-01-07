"use client";

import React from "react";
import { type IPropsGrid } from "../types";
import GridProvider from "../Provider";
import { GridDesktop, GridMobile } from "./views";
import GridMobileForm from "./views/GridMobileForm";

interface IClientProps extends IPropsGrid {
  parentType?: "grid" | "form" | "field";
  height?: string;
  showPagination?: boolean;
}

function MainClient({
  config,
  data,
  parentType = "grid",
  totalCount,
  onSelectRecords,
  initialSelectedRecords = {},
  height,
  showPagination = true,
}: IClientProps) {
  return (
    <GridProvider
      totalCount={totalCount}
      onSelectRecords={onSelectRecords}
      data={data}
      config={config}
      initialSelectedRecords={initialSelectedRecords}
    >
      <div className="hidden lg:flex">
        <GridDesktop parentType={parentType} hideSearch height={height} />
      </div>
      <div className="flex h-[500px] lg:hidden">
        {parentType === "grid" ? (
          <GridMobile shownPagination={showPagination} />
        ) : (
          <GridMobileForm shownPagination={showPagination} />
        )}
      </div>
    </GridProvider>
  );
}

export default MainClient;

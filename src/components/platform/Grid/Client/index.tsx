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
  hideSearch?: boolean;
  showAction?: boolean;
}

function MainClient({
  config,
  data,
  parentType = "grid",
  totalCount,
  onSelectRecords,
  initialSelectedRecords = {},
  height,
  hideSearch = true,
  showPagination = true,
  advanceFilter,
  showAction
}: IClientProps) {
  return (
    <GridProvider
      totalCount={totalCount}
      onSelectRecords={onSelectRecords}
      advanceFilter={advanceFilter}
      data={data}
      config={config}
      initialSelectedRecords={initialSelectedRecords}
      parentType={parentType}
    >
      <div className="hidden lg:flex">
        <GridDesktop parentType={parentType} hideSearch={hideSearch} height={height} showAction={showAction}/>
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

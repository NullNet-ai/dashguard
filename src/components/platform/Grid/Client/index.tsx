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
  parentProps?: {
    width?: string
    open?: boolean,
    summary ?: boolean
  }
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
  sorting,
  showAction,
  parentProps
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
      sorting={sorting}
    >
      <div className="hidden lg:grid">
        <GridDesktop parentType={parentType} hideSearch={hideSearch} height={height} showAction={showAction}
          parentProps={parentProps}
        />
      </div>

      <div className="flex h-[300px] lg:h-[500px] lg:hidden py-4 px-2 overflow-y-auto">
        {parentType === "grid" ? (
          <GridMobile shownPagination={showPagination} parentType={parentType}/>
        ) : (
          <GridMobileForm shownPagination={showPagination} parentType={parentType}/>
        )}
      </div>
    </GridProvider>
  );
}

export default MainClient;

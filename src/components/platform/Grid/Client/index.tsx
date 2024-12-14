"use client";

import React from "react";
import { type IPropsGrid } from "../types";
import GridProvider from "../Provider";
import { GridDesktop } from "./views";

interface IClientProps extends IPropsGrid {
  parentType?: "grid" | "form" | "field";
  height?: string;
}

function MainClient({
  config,
  data,
  parentType = "grid",
  totalCount,
  onSelectRecords,
  initialSelectedRecords = {},
  height,
}: IClientProps) {



  return (
    <GridProvider
      totalCount={totalCount}
      onSelectRecords={onSelectRecords}
      data={data}
      config={config}
      initialSelectedRecords={initialSelectedRecords}
    >
      <div className="hidden lg:block">
        <GridDesktop parentType={parentType} hideSearch height={height}/>
      </div>
      <div className="h-full lg:hidden">{/* <GridMobile /> */}</div>
    </GridProvider>
  );
}

export default MainClient;

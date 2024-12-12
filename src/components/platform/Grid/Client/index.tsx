"use client";

import React from "react";
import { type IPropsGrid } from "../types";
import GridProvider from "../Provider";
import { GridDesktop } from "./views";

interface IClientProps extends IPropsGrid {
  parentType?: "grid" | "form";
}

function MainClient({
  config,
  data,
  parentType = "grid",
  totalCount,
  onSelectRecords,
  initialSelectedRecords = {},
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
        <GridDesktop parentType={parentType} />
      </div>
      <div className="h-full lg:hidden">{/* <GridMobile /> */}</div>
    </GridProvider>
  );
}

export default MainClient;

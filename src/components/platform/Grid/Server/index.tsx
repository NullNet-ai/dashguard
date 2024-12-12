import React from "react";
import { type IPropsGrid } from "../types";
import GridProvider from "../Provider";
import { GridDesktop, GridMobile } from "./views";
import { GridScrollView } from "../common/GridScrollview";

function MainServer({ config, data, totalCount, sorting, defaultSorting }: IPropsGrid) {
  return (
    <GridProvider
      totalCount={totalCount}
      data={data}
      sorting={sorting}
      config={config}
      defaultSorting={defaultSorting}
    >
      <GridScrollView className="hidden lg:block">
        <GridDesktop />
      </GridScrollView>
      <div className="my-10 h-full md:my-8 md:mb-12 lg:mb-0 lg:hidden">
        <GridMobile />
      </div>
    </GridProvider>
  );
}

export default MainServer;

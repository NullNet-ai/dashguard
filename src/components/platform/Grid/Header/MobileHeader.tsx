import React from "react";
import Search from "../Search";
import Sorting from "../Sorting";

export default function MobileHeader() {
  return (
    <div className="flex flex-col py-2 pb-0 lg:flex-row lg:justify-between">
      <Search />
      <Sorting />
  </div>
  );
}

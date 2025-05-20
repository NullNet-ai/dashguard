"use client";

import { createContext, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button as Button2 } from "@headlessui/react";

import type { IRecordWrapperContext, IRecordWrapperProviderProps } from "./types";

export const RecordWrapperContext = createContext<IRecordWrapperContext>({
  isCollapseRecordSummary: false,
});

const RecordWrapperProvider = (props: IRecordWrapperProviderProps) => {
  const [isCollapseRecordSummary, setIsCollapseRecordSummary] = useState(false);

  const handleClickCollapseButton = () => {
    setIsCollapseRecordSummary(prev => !prev);
  }

  return <RecordWrapperContext.Provider value={{
    isCollapseRecordSummary,
    onClickCollapseButton: handleClickCollapseButton
  }}>
    <div className={`h-full border-r border-slate-100`}>
      {props.children}
      { !isCollapseRecordSummary ? props.summaryChildren : null}
    </div>
  </RecordWrapperContext.Provider>
};

export default RecordWrapperProvider;

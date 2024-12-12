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
    {isCollapseRecordSummary && <Button2 className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary hover:opacity-70 mt-3" onClick={handleClickCollapseButton}>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
    </Button2>}
    <div className={`h-full border-r border-slate-100`}>
      {!isCollapseRecordSummary && props.children}
    </div>
  </RecordWrapperContext.Provider>
};

export default RecordWrapperProvider;

"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "lucide-react";
import { useContext, useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { StatusPoint } from "~/components/ui/StatusPoint";
import useScreenType from "~/hooks/use-screen-type";
import { RecordContext } from "../../Provider";
import { RecordWrapperContext } from "../../providers/RecordWrapperProvider";
import DefaultSummaryMenuOptions from "../Menu/DefaultSummaryMenuOptions";
import  capitalize  from 'lodash/capitalize';

const ellipsis = (str: string, length: number) => {
  const sanitizedStr = str?.replace(/["']/g, "");
  return sanitizedStr?.length > length
    ? sanitizedStr.substring(0, length) + "..."
    : sanitizedStr;
};

export default function IdentifierComponent({
  code,
  status,
}: {
  code: string;
  status: string;
}) {
  const { state } = useContext(RecordContext);
  const { isCollapseRecordSummary, onClickCollapseButton } =
    useContext(RecordWrapperContext);
  const size = useScreenType();

  const memoizedRecordData = useMemo(() => ({
    status: status,
    recordId: state?.entityCode ?? "",
    entityName: state?.entityName,
  }), [state?.entityCode, state?.entityName, code, status]);

  const handleClickCollapseButton = () => onClickCollapseButton?.();

  const entityName = state?.entityName;
  
  return (
    <div className="flex flex-row items-center justify-between p-2 px-4 text-sm">
      <div className="flex flex-row items-center gap-x-1">
        <StatusPoint variant={status === "Archived" ? "secondary" : "success"} />
        <span data-test-id={entityName + "-rcrd-code"} className='font-semibold me-2'>
          {ellipsis(JSON.stringify(code), 8)}
        </span>
        <Badge variant={status === "Archived" ? "secondary" : "success"}>
          {capitalize(status)}
        </Badge>
      </div>
      <div className="flex flex-row items-center gap-x-1">
        <ChevronLeftIcon
          className={`hidden h-4 w-4 text-slate-500 md:block cursor-pointer transition-transform ${
            isCollapseRecordSummary ? "rotate-180" : ""
          }`}
          onClick={handleClickCollapseButton}
        />
        <ChevronDownIcon
          className={`h-4 w-4 text-slate-500 md:hidden cursor-pointer transition-transform ${
            isCollapseRecordSummary ? "rotate-180" : ""
          }`}
          onClick={handleClickCollapseButton}
        />
        <DefaultSummaryMenuOptions
          key={Math.random()}
          menuOptionConfig={state?.identifierOption}
          memoizedRecordData={memoizedRecordData}
        />
      </div>
    </div>
  );
}
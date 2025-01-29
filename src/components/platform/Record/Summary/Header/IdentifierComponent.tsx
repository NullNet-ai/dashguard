"use client";

import {
  ChevronLeftIcon
} from "@heroicons/react/24/outline";
import { capitalize } from "lodash";
import { ChevronDownIcon } from "lucide-react";
import { useContext, useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { StatusPoint } from "~/components/ui/StatusPoint";
import useScreenType from "~/hooks/use-screen-type";
import { RecordContext } from "../../Provider";
import { RecordWrapperContext } from "../../providers/RecordWrapperProvider";
import DefaultSummaryMenuOptions from "../Menu/DefaultSummaryMenuOptions";
const ellipsis = (str: string, length: number) => {
  const sanitizedStr = str?.replace(/["']/g, ""); // Remove both single and double quotes
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

  const memoizedRecordData = useMemo(() => {
    return {
      status: status,
      recordId: state?.entityCode ?? "",
      entityName: state?.entityName,
    };
  }, [state?.entityCode, state?.entityName, code, status]);

  const handleClickCollapseButton = () => {
    if (onClickCollapseButton) {
      onClickCollapseButton();
    }
  };

  const entityName = state?.entityName;
  return (
    <div className="flex flex-row items-center justify-between p-2 px-4 text-sm">
      <div className="flex flex-row items-center gap-x-1">
        <StatusPoint variant={status === "Archived" ? "secondary" : "success"} />
        <span data-test-id={entityName + "-rcrd-code"}>
          {ellipsis(JSON.stringify(code), 8)}
        </span>{" "}
        <Badge variant={status === "Archived" ? "secondary" : "success"}>{capitalize(status)}</Badge>
      </div>
      <div className="flex flex-row items-center gap-x-1">
        {/* <Button2>
          <StarIcon className="h-5 w-5 text-yellow-400" />
        </Button2> */}
        {/* <Button2 className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary hover:opacity-70" onClick={handleClickCollapseButton}>
          {
            isCollapseRecordSummary ? <ChevronRightIcon className="h-4 w-4 text-slate-500" />
            : <ChevronLeftIcon className="h-4 w-4 text-slate-500" />
          }
        </Button2> */}
        <ChevronLeftIcon className="hidden h-4 w-4 text-slate-500 md:block" />
        <ChevronDownIcon className="h-4 w-4 text-slate-500 md:hidden" />
        <DefaultSummaryMenuOptions
            key={Math.random()}
            menuOptionConfig={state?.identifierOption}
            memoizedRecordData={memoizedRecordData}
          />
      </div>
    </div>
  );
}

"use client";

import { ChevronLeftIcon } from "lucide-react";
import { ReactNode, useContext, useMemo, useState } from "react";
import { RecordContext, useRecord } from "../../Provider";
import { RecordWrapperContext } from "../../providers/RecordWrapperProvider";
import DefaultSummaryMenuOptions from "../Menu/DefaultSummaryMenuOptions";
import { Button } from '@headlessui/react';
import { cn } from '~/lib/utils';
import { useRef, useEffect } from "react";

interface IProps {
  code: string;
  status: string;
  actions?: ReactNode[];
}

export default function IdentifierComponent({
  code,
  status,
  actions
}: IProps ) {
  const { state } = useContext(RecordContext);
  const { isCollapseRecordSummary, onClickCollapseButton } =
    useContext(RecordWrapperContext);

  const [clickedButtonIndex, setClickedButtonIndex] = useState<number | null>(null);
  const {state: recordState} = useRecord() ?? {};

  const memoizedRecordData = useMemo(() => ({
    status: status,
    recordId: state?.entityCode ?? "",
    entityName: state?.entityName,
    recordDetails: state?.recordDetails,
  }), [state?.entityCode, state?.entityName, code, status]);

  const handleClickCollapseButton = () => onClickCollapseButton?.();

  // add actions here
  const actionsBtns = [
    <DefaultSummaryMenuOptions
      status={status}
      key={state?.recordId}
      menuOptionConfig={state?.identifierOption}
      memoizedRecordData={memoizedRecordData}
    />,
    ...(actions ?? [])
  ]

  const actionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionsContainerRef.current &&
        !actionsContainerRef.current.contains(event.target as Node)
      ) {
        setClickedButtonIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if(recordState?.config?.showToolbar === false) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div 
        ref={actionsContainerRef}
        className={cn(
          "flex items-center w-full min-w-12",
          { 
            'justify-between': actionsBtns.length > 3
          }
        )}>
        {actionsBtns.map((action, index) => (
          <div
            className={cn(
              'flex justify-center pt-1 w-full cursor-pointer border-b-2 border-solid border-transparent',
              {
                'border-primary': clickedButtonIndex === index
              },
            )}
            key={index}
            tabIndex={0}
            onMouseDown={() => setClickedButtonIndex(index)}
            onFocus={() => setClickedButtonIndex(index)}
          >
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}
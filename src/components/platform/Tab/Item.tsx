"use client";

import { Fragment } from "react";
import { cn } from "~/lib/utils";
import CloseTab from "./CloseKebab";
import { formatAndCapitalize } from "~/lib/utils";
type ItemProps = {
  tab: any;
};

const Item = ({ tab }: ItemProps) => {
  const padding = tab.name === "dashboard" ? "pr-[8px]" : "pr-0";
  const checkIfUserRole = (entity: string) =>
    entity === "user_role" ? true : false;

  return (
    <Fragment key={checkIfUserRole(tab.name) ? "role" : tab.name}>
      <div className="group relative flex items-center">
        <a
          data-test-id={
            "mntab-" +
            (checkIfUserRole(tab.name) ? "role" : tab.name)
              .split(" ")
              .join("-")
              .toLowerCase()
          }
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          className={cn(
            tab.current
              ? "text-primary rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary"
              : "text-gray-500",
            "whitespace-nowrap px-[8px] py-1 text-sm font-medium  max-h-[32px]",
            "flex items-center pl-[8px] space-x-2",
            "hover:border-t-primary hover:text-primary relative",
            padding,
          )}
        >
          {tab.current ? <span className="w-full absolute left-0 bottom-[-4px] md:bottom-[-7px] lg:bottom-[-3px]  bg-white dark:bg-black  h-[3px] md:h-[3px] z-10"/> : null}
          {formatAndCapitalize(checkIfUserRole(tab.name) ? "role" : tab.name)}
          <CloseTab {...tab} />
        </a>
{/* 
        {tab.current && (
          <div className="absolute bottom-[-10px] z-10 h-1 w-full bg-white"></div>
        )} */}
      </div>
    </Fragment>
  );
};

export default Item;

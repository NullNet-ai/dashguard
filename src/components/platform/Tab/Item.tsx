"use client";

import { Fragment } from "react";
import { cn } from "~/lib/utils";
import CloseTab from "./CloseKebab";
import { formatAndCapitalize } from "~/lib/utils";
type ItemProps = {
  tab: any;
};

const Item = ({ tab }: ItemProps) => {

  const padding = tab.name === "dashboard" ? "pr-4" : "pr-0";

  return (
    <Fragment key={tab.name}>
      <div className="group relative flex items-center">
        <a
          data-test-id={"mntb-" + tab.name.split(" ").join("-").toLowerCase()}
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          className={cn(
            tab.current
              ? "rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary text-primary"
              : "text-gray-500",
            "whitespace-nowrap px-4 pt-2  text-sm font-medium",
            "flex items-center space-x-2",
            "hover:border-t-primary hover:text-primary",
            padding
          )}
        >
          {formatAndCapitalize(tab.name)}
          <CloseTab {...tab} />
        </a>

        {tab.current && (
          <div className="absolute bottom-[-10px] z-10 h-1 w-full bg-white"></div>
        )}
      </div>
    </Fragment>
  );
};

export default Item;

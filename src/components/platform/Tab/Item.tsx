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
          data-test-id={"mntab-" + tab.name.split(" ").join("-").toLowerCase()}
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          className={cn(
            tab.current
              ? "md:rounded-t-lg md:border-b-0 md:border-l md:border-r md:border-t-2 md:border-t-primary text-primary"
              : "text-gray-500",
            "whitespace-nowrap px-4 md:pt-2 py-1.5 text-sm font-medium",
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

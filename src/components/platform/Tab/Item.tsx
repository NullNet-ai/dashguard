"use client";

import { Fragment, useMemo } from "react";
import { cn } from "~/lib/utils";
import CloseTab from "./CloseKebab";
import { formatAndCapitalize } from "~/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
type ItemProps = {
  tab: any;
};

const Item = ({ tab }: ItemProps) => {
  const padding = tab.name === "dashboard" ? "pr-4" : "pr-0";
  const checkIfUserRole = (entity: string) =>
    entity === "user_role" ? true : false;

  const pathname = usePathname();
  const [, , entity] = pathname?.split("/");

  const isActive = useMemo(() => {
    const [, , entityName] = (tab.href || "").split("/");
    return entityName === entity;
  }, [entity]);

  return (
    <Fragment key={checkIfUserRole(tab.name) ? "role" : tab.name}>
      <div className="group relative flex items-center">
        <Link
          data-test-id={
            "mntab-" +
            (checkIfUserRole(tab.name) ? "role" : tab.name)
              .split(" ")
              .join("-")
              .toLowerCase()
          }
          href={tab.href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            isActive
              ? "text-primary md:rounded-t-lg md:border-b-0 md:border-l md:border-r md:border-t-2 md:border-t-primary"
              : "text-gray-500",
            "whitespace-nowrap px-4 py-1.5 text-sm font-medium md:pt-2",
            "flex items-center space-x-2",
            "hover:border-t-primary hover:text-primary",
            padding,
          )}
        >
          {formatAndCapitalize(checkIfUserRole(tab.name) ? "role" : tab.name)}
          <CloseTab {...tab} />
        </Link>

        {isActive && (
          <div className="absolute bottom-[-10px] z-10 h-1 w-full bg-white"></div>
        )}
      </div>
    </Fragment>
  );
};

export default Item;

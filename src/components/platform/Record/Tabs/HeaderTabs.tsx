import { capitalize } from "lodash";
import { cn } from "~/lib/utils";
import { type PropsWithChildren } from "react";
import { headers } from "next/headers";
import { type ITabs } from "../types";
import TabItems from "./TabItems";

interface headerTabType extends PropsWithChildren {
  tabs: ITabs[];
}

const HeaderTabs = ({ tabs }: headerTabType) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier, tabName] = pathname.split("/");

  const constructTabLink = tabs?.map((tab) => {
    return {
      id: tab.id,
      name: tab.name,
      href: `/portal/${mainEntity}/record/${identifier}/${tab.tabName}`,
      current: tab.tabName === tabName,
    };
  });

  return (
    <TabItems  tabs={constructTabLink} pathname={pathname}/>
  );
};

export default HeaderTabs;

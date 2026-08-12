import { type PropsWithChildren } from "react";
import { headers } from "next/headers";
import { type ITabs } from "../types";
import TabItems from "./TabItems";

interface headerTabType extends PropsWithChildren {
  tabs: ITabs[];
  tab_items_left_slot?: React.ReactNode;
}

const HeaderTabs = async ({ tabs, tab_items_left_slot }: headerTabType) => {
  const headerList = await headers();
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
    <TabItems
      tabs={constructTabLink}
      pathname={pathname}
      tab_items_left_slot={tab_items_left_slot}
    />
  );
};

export default HeaderTabs;

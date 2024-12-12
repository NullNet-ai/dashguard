import { headers } from "next/headers";
import { capitalize } from "lodash";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";

import TabMenu from "~/components/application-layout/common/TabMenu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { type IPropsTabList } from "./type";
import InnerTabItems from "./InnerTabItems";

const getSessionTabs = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity, application, identifier] =
    pathname.split("/") || "New Tab";
  const currentContext = "/" + portal + "/" + mainEntity;
  const stateTabs = (await api.tab
    .getSubTabs({
      current_context: currentContext,
    })
    .then((res) => {
      return res?.tabs ?? [];
    })
    .catch(() => {
      return [];
    })) as IPropsTabList[];

  const grid = stateTabs.find((item) => item.name === "Grid");
  const hasIdentifier = stateTabs?.find((item) => item.name === identifier);
  const newTabs = stateTabs.map((tab) => {
    const path = tab?.name === "Grid" ? pathname : `/${portal}/${mainEntity}/${application}/${identifier}` ;
    const href = tab?.name === "Grid" ? tab.href.replace(/\/\d+$/, '') : tab.href; 
    return {
      name: tab.name,
      href: tab.href,
      current : href.match(path) ? true : false,
    };
  });

  if (application === "grid" && !grid) {
    newTabs.push({
      name: "Grid",
      href: pathname,
      current: true,
    });
  }

  if (application === "wizard" && !hasIdentifier && identifier) {
    newTabs.push({
      name: identifier,
      href: pathname,
      current: true,
    });
  }

  if (application === "record" && !hasIdentifier && identifier) {
    newTabs.push({
      name: identifier,
      href: pathname,
      current: true,
    });
  }

  api.tab.insertSubTabs({
    current_context: currentContext,
    tabs: newTabs,
  });

  return newTabs;
};

const InnerTabs = async () => {
  const newTabs = await getSessionTabs();
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  if (!newTabs?.length) return null;

  // const mainTabs = newTabs.slice(0, 6);
  // const dropdownTabs = newTabs.slice(6);

  return (
   <InnerTabItems 
      tabs={newTabs}
      pathname={pathname}
   />
  );
};

export default InnerTabs;

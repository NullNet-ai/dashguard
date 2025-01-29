import { headers } from "next/headers";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import TabItems from "./TabItems";
import type { IPropsTabList } from "./type";

const getSessionTabs = async (): Promise<{
  pathname: string;
  newTabs: IPropsTabList[];
}> => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity, , ,] = pathname.split("/") || "New Tab";
  const stateTabs = (await api.tab.getMainTabs()) as IPropsTabList[];
  const currentContext = `/${portal}/${mainEntity}`;

  let newTabs = stateTabs.map((tab) => {
    return {
      name: tab.name,
      href: tab.href,
      current: tab.href.match(currentContext) ? true : false,
    };
  });

  if (newTabs.length === 0) {
    newTabs = [
      {
        name: mainEntity!,
        href: pathname,
        current: true,
      },
    ];
  }

  if (!newTabs.find((item) => item.current === true)) {
    newTabs.push({
      name: mainEntity!,
      href: pathname,
      current: true,
    });
  }

  api.tab.insertMainTabs(newTabs);
  return { pathname, newTabs };
};

export default async function TabList({ className }: { className?: string }) {
  const { newTabs } = await getSessionTabs();
  if (!newTabs?.length) return null;
  return (
    <nav aria-label="Tabs" className={cn("flex flex-1", className)}>
      <TabItems items={newTabs} />
    </nav>
  );
}

import { headers } from "next/headers";
import { api } from "~/trpc/server";
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
    let path;
    let href;
    const main = `/${portal}/${mainEntity}/${application}/${identifier}`;
    const [, , , _application, _current] = tab.href?.split("/");

    if (tab?.name === "Grid") {
      path = pathname;
      href = tab.href.replace(/\/\d+$/, "");
    } else if (
      _application === "record" &&
      !_current?.includes("current_tab")
    ) {
      const curr_tab = "?current_tab=dashboard";
      path = `${main}/${curr_tab}`;
      href = `${tab.href}/${curr_tab}`;
    } else {
      path = `${main}`;
      href = tab.href;
    }

    return {
      name: tab.name,
      href,
      current: href.match(path) ? true : false,
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
      href: `${pathname}?current_tab=dashboard`,
      current: true,
    });
  }

  api.tab.insertSubTabs({
    current_context: currentContext,
    tabs: newTabs,
  });

  await api.grid.defaultGridTab({
    application: application || "",
    entity: mainEntity || "",
  });

  return newTabs;
};

const InnerTabs = async () => {
  const newTabs = await getSessionTabs();
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  return <InnerTabItems tabs={newTabs} pathname={pathname} />;
};

export default InnerTabs;

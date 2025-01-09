import { Overwrite, Simplify } from "@trpc/server/unstable-core-do-not-import";
import { headers } from "next/headers";
import { ITabGrid } from "~/server/api/types";

export const gridCacheId = async  ({ context, type }: { context: any, type: 'filter' | 'sorting' | 'pagination' }) => {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const gridTabId = headerList.get("x-grid-tab-id") || "";
  const _id = context.session.account.contact.id
  const [, , mainEntity, application, identifier] = pathName.split("/");
  if(application === "grid") {
    const tabMenuId = `${_id}:${mainEntity}:${application}`;
    if(!gridTabId) {
      const gridTabFilterList = (await context.redisClient.getCachedData(
        tabMenuId,
      )) as ITabGrid[];
      const _gridTableFilterList = Array.isArray(gridTabFilterList) ? gridTabFilterList : []
      const activeTab = _gridTableFilterList?.find((tab) => tab.current);
      if(!activeTab) return null;
      return `${tabMenuId}:${activeTab?.id}:${type}`;
    }
    return `${tabMenuId}:${gridTabId}:${type}`;
  }
  if(application === "record") {
    const recordCurrentTab = headerList.get("x-record-current-tab") || "";
    return `${application}_${mainEntity}:${identifier}:${recordCurrentTab}:grid:${type}`;
  }
};

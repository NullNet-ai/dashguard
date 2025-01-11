import { Overwrite, Simplify } from "@trpc/server/unstable-core-do-not-import";
import { headers } from "next/headers";
import { ITabGrid } from "~/server/api/types";

export type TReportDataType = "filter" | "sorting" | "pagination" | "grid_tabs";

export const gridCacheId = async ({
  context,
  type,
}: {
  context: any;
  type: TReportDataType;
}) => {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const gridTabId = headerList.get("x-grid-tab-id") || "";
  const _id = context.session.account.contact.id;
  const [, , mainEntity, application, identifier] = pathName.split("/");
  const mainAppId = `${_id}:${mainEntity}:${application}`;

  if (application === "grid") {
    if (type === "grid_tabs") {
      return mainAppId;
    }
    if (!gridTabId) {
      const cachedGridTabFilterData = (await context.redisClient.getCachedData(
        mainAppId,
      )) as ITabGrid[];
      const gridTableFilterList = Array.isArray(cachedGridTabFilterData)
        ? cachedGridTabFilterData
        : [];
      const activeTab = gridTableFilterList?.find((tab) => tab.current);
      if (!activeTab) return null;
      return `${mainAppId}:${activeTab?.id}:${type}`;
    }
    return `${mainAppId}:${gridTabId}:${type}`;
  }
  if (application === "record") {
    const recordCurrentTab = headerList.get("x-record-current-tab") || "";
    return `${mainAppId}:${identifier}:${recordCurrentTab}:grid:${type}`;
  }
};

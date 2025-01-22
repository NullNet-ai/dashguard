import MENU from "../../menu";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { headers } from "next/headers";

export const menuRouter = createTRPCRouter({
  getMenuConfig: publicProcedure.query(async () => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";

    const menuItems = MENU as ISidebarMenu[];

    // Update isActive for groups based on their items
    menuItems.forEach((item) => {
      item.isActive = item?.items?.some((subItem) =>
        pathName?.includes(subItem.url!),
      );
      if (item.groups) {
        item.groups.forEach((group) => {
          group.isActive = group?.items?.some((subItem) =>
            pathName?.includes(subItem.url!),
          );
        });
      }
    });

    return menuItems;
  }),
});

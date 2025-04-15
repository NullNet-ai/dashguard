import MENU from "../../menu";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ISidebarMenu } from "~/components/platform/SideBar/type";
import { headers } from "next/headers";
import arrangement from "../../menu/arrangement.json";
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

    const menuMap = menuItems.reduce(
      (acc, item) => {
        const itemTitle = item?.title
          ?.toLowerCase()
          .replace(/\s+/g, "_") as string;
        return {
          ...acc,
          [itemTitle]: item,
        };
      },
      {} as Record<string, ISidebarMenu>,
    );

    console.log("%c Line:41 🧀 menuMap", "color:#fca650", {arrangement,menuMap});
    const newMenuItems = arrangement.order.map(
      (key) => menuMap[key],
    ) as ISidebarMenu[];

    // Get the remaining items that are not in the newMenuItems array
    const remainingItems = menuItems.filter(
      (item) => !newMenuItems.includes(item),
    );

    if (remainingItems.length > 0) {
      // Add the remaining items to the end of the newMenuItems array
      newMenuItems.unshift(...remainingItems);
    }

    return newMenuItems;
  }),
});

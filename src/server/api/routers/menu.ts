import MENU from "../../../menu";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ISidebarMenu } from "~/components/platform/SideBar/type";

export const menuRouter = createTRPCRouter({
  getMenuConfig: publicProcedure.query(async () => {
    const menuItems = [
      ...MENU,
      // {
      //   groupTitle: "Platform",
      //   groups: [
      //     {
      //       title: "Settings",
      //       icon: "Cog8ToothIcon",
      //       isActive: pathName.includes("/setting"),
      //       items: [
      //         {
      //           title: "Role",
      //           url: getGridLink({
      //             mainEntity: "user_role",
      //           }),
      //           icon: "UserIcon",
      //           isActive: pathName.includes("/user_role"),
      //         },
      //       ],
      //     },
      //   ],
      // },
    ] as ISidebarMenu[];

    // Update isActive for groups based on their items
    menuItems.forEach((item) => {
      if (item.groups) {
        item.groups.forEach((group) => {
          group.isActive = group?.items?.some((subItem) => subItem.isActive);
        });
      }
    });

    return menuItems;
  }),
});

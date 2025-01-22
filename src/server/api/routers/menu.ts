import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";
import MENU from "../../../menu";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const menuRouter = createTRPCRouter({
  getMenuConfig: publicProcedure.query(async () => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";
    const menuItems = [
      ...MENU,
      {
        title: "Activity Log",
        icon: "DocumentTextIcon",
        isActive: pathName.includes("/activity_log"),
        items: [],
        url: "/portal/activity-log",
      },
      {
        title: "Contact",
        icon: "UserIcon",
        isActive: pathName.includes("/contact"),
        items: [],
        url: getGridLink({
          mainEntity: "contact",
        }),
      },
      {
        title: "Organization",
        icon: "UserGroupIcon",
        isActive: pathName.includes("/organization"),
        items: [],
        url: getGridLink({
          mainEntity: "organization",
        }),
      },
      {
        groupTitle: "Platform",
        groups: [
          {
            title: "Settings",
            icon: "Cog8ToothIcon",
            isActive: pathName.includes("/setting"),
            items: [
              {
                title: "Role",
                url: getGridLink({
                  mainEntity: "user_role",
                }),
                icon: "UserIcon",
                isActive: pathName.includes("/user_role"),
              },
            ],
          },
        ],
      },
    ] as {
      title?: string;
      icon?: string;
      isActive?: boolean;
      url?: string;
      groupTitle?: string;
      groups?: {
        title: string;
        icon?: string;
        isActive?: boolean;
        items: {
          title: string;
          url: string;
          icon?: string;
          isActive?: boolean;
        }[];
      }[];
    }[];

    // Update isActive for groups based on their items
    menuItems.forEach((item) => {
      if (item.groups) {
        item.groups.forEach((group) => {
          group.isActive = group.items.some((subItem) => subItem.isActive);
        });
      }
    });

    return menuItems;
  }),
});

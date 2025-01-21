import { headers } from "next/headers";
import { getGridLink } from "~/lib/grid-get-link";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const menuRouter = createTRPCRouter({
  getMenuConfig: publicProcedure.query(async () => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";
    const menuItems = [
      {
        title: "Dashboard",
        icon: "AcademicCapIcon",
        isActive: pathName.endsWith("/dashboard"),
        url: "/portal/dashboard",
        items: [],
      },

      {
        title: "Favorite",
        icon: "StarIcon",
        isActive: pathName.includes("/favorite"),
        items: [],
        url: "/portal/favorite",
      },
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
    ];

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

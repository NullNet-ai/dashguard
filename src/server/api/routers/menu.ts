import { headers } from "next/headers";
import { SetIdTab } from "~/lib/grid-default-tab";
import { getGridLink } from "~/lib/grid-get-link";
import { tabMenuId } from "~/lib/tab-menu-id";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const menuRouter = createTRPCRouter({
  getMenuConfig: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";
    const [, , mainEntity, application] = pathName.split("/");
    const _tabMenuId = tabMenuId({
      _mainEntity: mainEntity || "",
      _application: application || "",
      _id: ctx.session.account.contact.id,
    });
    const hasTabMenu = await ctx.redisClient.getCachedData(_tabMenuId);
    if (application === "grid" && mainEntity && !hasTabMenu) {
      const setIdTab = SetIdTab(mainEntity);
      ctx.redisClient.cacheData(
        getGridLink({
          mainEntity,
        }),
        setIdTab,
      );
      ctx.redisClient.cacheData(_tabMenuId, setIdTab);
    }
    const menuItems = [
      {
        title: "Dashboard",
        icon: "AcademicCapIcon",
        isActive: pathName.endsWith("/dashboard"),
        url: "/portal/dashboard",
        items: [],
      },

      {
        title: "Favorites",
        icon: "StarIcon",
        isActive: pathName.includes("/favorites"),
        items: [],
        url: "/portal/favorites",
      },
      {
        title: "Activity Log",
        icon: "DocumentTextIcon",
        isActive: pathName.includes("/activity_log"),
        items: [],
        url: "/portal/activity-log",
      },
      {
        title: "Contacts",
        icon: "UserIcon",
        isActive: pathName.includes("/contact"),
        items: [],
        url: getGridLink({
          mainEntity: "contact",
        }),
      },
      {
        title: "Organizations",
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
            title: "Reports",
            icon: "AcademicCapIcon",
            isActive: pathName.endsWith("/report"),
            items: [],
            url: getGridLink({
              mainEntity: "report",
            }),
          },
          {
            title: "Settings",
            icon: "Cog8ToothIcon",
            isActive: pathName.includes("/setting"),
            items: [
              {
                title: "Roles",
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

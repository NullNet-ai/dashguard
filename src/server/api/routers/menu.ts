import { headers } from "next/headers";
import { SetIdTab } from "~/lib/grid-default-tab";
import { getGridLink } from "~/lib/grid-get-link";
import { tabMenuId } from "~/lib/tab-menu-id";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import MENU from "../../../menu";

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
      // ...MENU,
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

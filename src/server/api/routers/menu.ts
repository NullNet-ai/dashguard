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
        url: "/portal/coming-soon",
      },
      {
        title: "Activity Log",
        icon: "DocumentTextIcon",
        isActive: pathName.includes("/activity_log"),
        items: [],
        url: "/portal/coming-soon",

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
        title: "Positions",
        icon: "DocumentMagnifyingGlassIcon",
        isActive: pathName.includes("/position"),
        items: [],
        url: getGridLink({
          mainEntity: "position",
        }),
      },
      {
        title: "Bookings",
        icon: "CalendarDaysIcon",
        isActive: pathName.includes("/booking"),
        items: [],
        url: getGridLink({
          mainEntity: "booking",
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
              {
                title: "Position Roles",
                url: getGridLink({
                  mainEntity: "position_role",
                }),
                icon: "BriefcaseIcon",
                isActive: pathName.includes("/position_role"),
              },
              {
                title: "Position Types",
                url: getGridLink({
                  mainEntity: "position_type",
                }),
                icon: "BriefcaseIcon",
                isActive: pathName.includes("/position_type"),
              },
              {
                title: "Degree Levels",
                url: getGridLink({
                  mainEntity: "degree_level",
                }),
                icon: "AcademicCapIcon",
                isActive: pathName.includes("/degree_level"),
              },
              {
                title: "Country",
                url: getGridLink({
                  mainEntity: "country",
                }),
                icon: "MapIcon",
                isActive: pathName.includes("/country"),
              },
              {
                title: "City",
                url: getGridLink({
                  mainEntity: "city",
                }),
                icon: "MapIcon",
                isActive: pathName.includes("/city"),
              },
              {
                title: "Employment Types",
                url: getGridLink({
                  mainEntity: "employment_type",
                }),
                icon: "BuildingOfficeIcon",
                isActive: pathName.includes("/employment_type"),
              },
              {
                title: "Benefits",
                url: getGridLink({
                  mainEntity: "benefit",
                }),
                icon: "ClipboardDocumentCheckIcon",
                isActive: pathName.includes("/benefit"),
              },
              {
                title: "Pay Periods",
                url: getGridLink({
                  mainEntity: "pay_period",
                }),
                icon: "CalendarDaysIcon",
                isActive: pathName.includes("/pay_period"),
              },
              {
                title: "Work Setups",
                url: getGridLink({
                  mainEntity: "work_setup",
                }),
                icon: "WorkIcon",
                isActive: pathName.includes("/work_setup"),
              },
              {
                title: "Requirement Types",
                url: getGridLink({
                  mainEntity: "requirement_type",
                }),
                icon: "DocumentTextIcon",
                isActive: pathName.includes("/requirement_type"),
              },
              {
                title: "Reminders",
                url: getGridLink({
                  mainEntity: "reminder",
                }),
                icon: "DocumentTextIcon",
                isActive: pathName.includes("/reminder"),
              },
              {
                title: "Timezones",
                url: getGridLink({
                  mainEntity: "timezone",
                }),
                icon: "DocumentTextIcon",
                isActive: pathName.includes("/timezone"),
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

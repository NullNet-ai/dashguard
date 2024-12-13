import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { EOrderDirection } from "@dna-platform/common-orm/build/enums/model";
import { type IAdvanceFilters, type IResponse } from "@dna-platform/common-orm";
import { headers } from "next/headers";
import ZodCreateEntity from "~/server/zodSchema/grid/createEntity";
import ZodGetFilters from "~/server/zodSchema/grid/getFilters";
import ZodSaveFilters from "~/server/zodSchema/grid/saveFilters";
import ZodItems from "~/server/zodSchema/grid/items";
import { EStatus, type IGridFilterBy, type ITabGrid } from "../types";
import { tabMenuId } from "~/lib/tab-menu-id";
import { z } from "zod";
import { SetTab } from "~/lib/grid-default-tab";
import { type ISortBy } from "~/components/platform/Grid/Category/type";
import { SortingState } from "@tanstack/react-table";
import { formatSorting } from "~/server/utils/formatSorting";

export const gridRouter = createTRPCRouter({
  createEntity: privateProcedure
    .input(ZodCreateEntity)
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.DRAFT,
            },
            pluck: ["id", "code"],
          },
        })
        .execute()
        .catch((error) => {
          console.error("@Error Grid", error);
        });

      ctx?.redisClient
        .cacheData(
          `wizard_${input.entity}:${record?.data?.[0]?.id}`,
          JSON.stringify(1),
        )
        .then(() => {
          return "Cached";
        })
        .catch((error) => {
          console.error("@Error Grid", error);
          return "Error";
        });
      ctx?.redisClient
        .cacheData(
          `wizard_${input.entity}:${record?.data?.[0]?.code}`,
          JSON.stringify(1),
        )
        .then(() => {
          return "Cached";
        })
        .catch((error) => {
          console.error("@Error Grid", error);
          return "Error";
        });
      return record as IResponse<Record<string, any>>;
    }),
  items: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
      } = input; // Default limit = 10 items per page, default current page = 1
      // Calculate the number of items to skip based on the current page
      // Fetch the total count of users

      let advance_filters = _advance_filters;

      /**
       *
       * @Logic to get filters from the grid tab
       *
       */
      const headerList = headers();
      const gridTabId = headerList.get("x-grid-tab-id") || "";
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity] = pathName.split("/");
      const _tabMenuHref = `/portal/${mainEntity}/grid`;
      const tabList = (await ctx.redisClient
        .getCachedData(_tabMenuHref)
        .then((data) => {
          if (data) {
            return data;
          }
          return [];
        })
        .catch((err) => {
          console.error("@Error Grid", err);
          return [];
        })) as ITabGrid[];
      const tabFound = tabList?.find((tab) => {
        return tab.id === gridTabId || tab.current;
      })?.id;

      if (tabFound || gridTabId) {
        const filter_by = await ctx.redisClient
          .getCachedData(`${gridTabId || tabFound || ""}:filters`)
          .then((data) => {
            if (data) {
              return data;
            }
            return [];
          })
          .catch((error) => {
            console.error("@Error Grid", error);
            return [];
          });
        advance_filters = [...advance_filters, ...filter_by]; //TBC
      }
      /**
       *
       * @Logic to get filters from the grid tab
       *
       */

      const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
        .findAll({
          entity: input?.entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters: advance_filters as IAdvanceFilters[],
            order: {
              starts_at:
                // current 5 *  input.limit 50 = 250
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
              by_field: "code",
              by_direction: EOrderDirection.DESC,
            },
            multiple_sort: input.sorting?.length
              ? formatSorting(input.sorting)
              : [],
          },
        })
        .execute();
      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);
      return {
        totalCount, // Total number of users
        items, // Paginated users
        currentPage: current, // The current page
        totalPages, // Total number of pages
      };
    }),
  getSessionGridTabs: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const gridTabId = headerList.get("x-grid-tab-id") || "";
    const pathName = headerList.get("x-pathname") || "";
    const [, , mainEntity, application] = pathName.split("/");
    if (application !== "grid" || !mainEntity) return [];
    const _tabMenuId = tabMenuId({
      _mainEntity: mainEntity || "",
      _application: application || "",
      _id: ctx.session.account.contact.id,
    });
    const _tabMenuHref = `/portal/${mainEntity}/grid`;
    const activeTab = (await ctx.redisClient.getCachedData(
      _tabMenuId,
    )) as ITabGrid[];
    if (!gridTabId) {
      return activeTab;
    }
    const gridTabFilterList = (await ctx.redisClient.getCachedData(
      _tabMenuId,
    )) as ITabGrid[];
    const setActiveTab = gridTabFilterList?.map((tab) => {
      const newCurrent =
        _tabMenuHref === gridTabId
          ? activeTab?.find((e) => e.id === gridTabId)
          : gridTabId;
      return {
        ...tab,
        current: tab.id === newCurrent,
      };
    });

    ctx.redisClient.cacheData(_tabMenuId, setActiveTab);

    return setActiveTab;
  }),
  appendGridTab: privateProcedure
    .input(
      z.object({
        filter_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || "",
        _application: application || "",
        _id: ctx.session.account.contact.id,
      });

      const filters = await ctx.redisClient.getCachedData(
        `${input.filter_id}:filters`,
      );
      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const found = menus?.find((menu) => menu.id === input.filter_id);
      const copyTab = SetTab({
        name: found?.name || "",
        entity: mainEntity!,
      });
      const newTabs = [...menus, copyTab]?.map((item) => {
        if (item.id === copyTab.id) {
          return {
            ...item,
            current: true,
          };
        }
        return {
          ...item,
          current: false,
        };
      });
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
      await ctx.redisClient.cacheData(`${copyTab.id}:filters`, filters);
      return {
        filter_href: copyTab.href,
      };
    }),
  removeGridTab: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || "",
        _application: application || "",
        _id: ctx.session.account.contact.id,
      });
      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      const newTabs = menus?.filter((tab) => tab.id !== input);
      const activeTab = newTabs?.find((tab) => tab.current);
      const activeTabBeenRemoved = newTabs?.map((item, index) => {
        if (index === newTabs?.length - 1) {
          return {
            ...item,
            current: true,
          };
        }
        return item;
      });

      await ctx.redisClient.cacheData(
        _tabMenuId,
        activeTab ? newTabs : activeTabBeenRemoved,
      );

      return {
        filter_href: activeTab
          ? activeTab?.href
          : activeTabBeenRemoved?.find((tab) => tab.current)?.href,
      };
    }),
  saveFilters: privateProcedure
    .input(ZodSaveFilters)
    .mutation(async ({ input, ctx }) => {
      return await ctx.redisClient.cacheData(
        `${input.filter_id}:filters`,
        input.filters,
      );
    }),
  getFilters: privateProcedure
    .input(ZodGetFilters)
    .query(async ({ input, ctx }) => {
      const filters = (await ctx.redisClient.getCachedData(
        `${input.filter_id}:filters`,
      )) as IGridFilterBy[];
      return filters;
    }),
  saveSorts: privateProcedure
    .input(
      z.object({
        filter_id: z.string(),
        sort_by_field: z.string(),
        sort_by_direction: z.enum(["asc", "desc", "ascending", "descending"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.redisClient.cacheData(`${input.filter_id}:sorts`, {
        sort_by_field: input.sort_by_field,
        sort_by_direction: input.sort_by_direction,
      });
    }),
  getSorts: privateProcedure
    .input(ZodGetFilters)
    .query(async ({ input, ctx }) => {
      const sorts = (await ctx.redisClient.getCachedData(
        `${input.filter_id}:sorts`,
      )) as ISortBy;
      return sorts;
    }),
  newGridTab: privateProcedure
    .input(
      z.object({
        tabName: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || "",
        _application: application || "",
        _id: ctx.session.account.contact.id,
      });

      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const copyTab = SetTab({
        name: input?.tabName,
        entity: mainEntity!,
      });
      const newTabs = [...menus, copyTab]?.map((item) => {
        if (item.id === copyTab.id) {
          return {
            ...item,
            current: true,
          };
        }
        return {
          ...item,
          current: false,
        };
      });
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
      return {
        filter_id: copyTab.id,
        filter_href: copyTab.href,
        mainEntity: mainEntity!,
      } as {
        filter_id: string;
        filter_href: string;
        mainEntity: string;
      };
    }),
  deleteRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return (
        ctx.dnaClient
          // ! TODO Delete in ORM features ( Not Working )
          .update(input?.id, {
            entity: input?.entity,
            token: ctx.token.value,
            mutation: {
              params: {
                tombstone: 1,
              },
            },
          })
          .execute()
      );
    }),
  archiveRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ARCHIVED,
            },
          },
        })
        .execute();
    }),
  activateRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ACTIVE,
            },
          },
        })
        .execute();
    }),
  restoreRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dnaClient
        .getPreviousStatus(input.id, {
          entity: input?.entity,
          token: ctx.token.value,
        })
        .execute();

      const [previous_status] = result?.data || [];

      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: previous_status?.value || EStatus.DRAFT,
            },
          },
        })
        .execute();
    }),
  archiveBulkRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        record_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { entity, record_ids } = input;
      await Promise.all(
        record_ids.map(async (id) => {
          return ctx.dnaClient
            .update(id, {
              entity,
              token: ctx.token.value,
              mutation: {
                params: {
                  status: EStatus.ARCHIVED,
                },
              },
            })
            .execute();
        }),
      );
    }),
  updateReportSorting: privateProcedure
    .input(
      z.object({
        sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sorting } = input;
      const headerList = headers();

      const pathName = headerList.get("x-pathname") || "";
      const gridTabId = headerList.get("x-grid-tab-id") || "";
      const [, , mainEntity, application] = pathName.split("/");
      if (application !== "grid" || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || "",
        _application: application || "",
        _id: ctx.session.account.contact.id,
      });
      let sortingReportTabId = `${_tabMenuId}:${gridTabId}:sorting`;
      if (!gridTabId) {
        const gridTabFilterList = (await ctx.redisClient.getCachedData(
          _tabMenuId,
        )) as ITabGrid[];
        const activeTab = gridTabFilterList?.find((tab) => tab.current);
        sortingReportTabId = `${_tabMenuId}:${activeTab?.id}:sorting`;
      }

      return await ctx.redisClient.cacheData(sortingReportTabId, sorting);
    }),
  getReportSorting: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const gridTabId = headerList.get("x-grid-tab-id") || "";
    const pathName = headerList.get("x-pathname") || "";
    const [, , mainEntity, application] = pathName.split("/");
    if (application !== "grid" || !mainEntity) return [];
    const _tabMenuId = tabMenuId({
      _mainEntity: mainEntity || "",
      _application: application || "",
      _id: ctx.session.account.contact.id,
    });
    let sortingReportTabId = `${_tabMenuId}:${gridTabId}:sorting`;
    if (!gridTabId) {
      const gridTabFilterList = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const activeTab = gridTabFilterList?.find((tab) => tab.current);
      sortingReportTabId = `${_tabMenuId}:${activeTab?.id}:sorting`;
    }
    const sorting = (await ctx.redisClient.getCachedData(
      sortingReportTabId,
    )) as SortingState;
    return Array.isArray(sorting) ? sorting : [];
  }),
});

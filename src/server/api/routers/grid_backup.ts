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
import { type ISortBy } from "~/components/platform/Grid/Category/type";
import { SortingState } from "@tanstack/react-table";
import { formatSorting } from "~/server/utils/formatSorting";
import { pluralize } from "../../utils/pluralize";
import {
  IAdvanceFilter,
  IPagination,
  ISearchItem,
} from "~/components/platform/Grid/Search/types";
import { gridCacheId, TReportDataType } from "~/lib/grid-cache-id";
import { getGridLink } from "~/lib/grid-get-link";
import { SetIdTab, SetTab } from "~/lib/grid-default-tab";
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
  defaultGridTab: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        application: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input?.application !== "grid") return;
      const _tabMenuId = tabMenuId({
        _mainEntity: input?.entity || "",
        _application: input?.application || "",
        _id: ctx.session.account.contact.id,
      });

      const hasTabMenu = await ctx.redisClient.getCachedData(_tabMenuId);

      if (hasTabMenu) return hasTabMenu;
      if (input?.application === "grid") {
        const setIdTab = SetIdTab(input.entity);
        ctx.redisClient.cacheData(
          getGridLink({
            mainEntity: input.entity,
          }),
          setIdTab,
        );
        ctx.redisClient.cacheData(_tabMenuId, setIdTab);
      }
    }),
  items: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        entity,
        pluck_object: _pluck_object,
      } = input; // Default limit = 10 items per page, default current page = 1
      // Calculate the number of items to skip based on the current page
      // Fetch the total count of users

      /**
       *
       * @Logic to get filters from the grid tab
       *
       */

      const join_type =
        input?.entity === "contact"
          ? "self"
          : ("left" as "self" | "left" | "right" | "inner");

      const created_by_join = {
        type: join_type,
        field_relation:
          join_type === "self"
            ? {
                to: {
                  entity,
                  field: "created_by",
                },
                from: {
                  ...(join_type === "self" ? { alias: "created_by" } : {}),
                  entity: "contact",
                  field: "id",
                },
              }
            : {
                from: {
                  entity,
                  field: "created_by",
                },
                to: {
                  ...(join_type === "left" ? { alias: "created_by" } : {}),
                  entity: "contact",
                  field: "id",
                },
              },
      };
      const updated_by_join = {
        type: join_type,
        field_relation:
          join_type === "self"
            ? {
                to: {
                  entity,
                  field: "updated_by",
                },
                from: {
                  ...(join_type === "self" ? { alias: "updated_by" } : {}),
                  entity: "contact",
                  field: "id",
                },
              }
            : {
                from: {
                  entity,
                  field: "updated_by",
                },
                to: {
                  ...(join_type === "left" ? { alias: "updated_by" } : {}),
                  entity: "contact",
                  field: "id",
                },
              },
      };

      const pluck_object = {
        contacts: ["first_name", "last_name"],
        [pluralize(input?.entity)]: input.pluck,
      };

      const is_case_sensitive_sorting = "false";
      const query = ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          pluck_object: pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
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
          //@ts-expect-error - multiple_sort is not defined in the type
          multiple_sort: input.sorting?.length
            ? formatSorting(input.sorting, input?.entity, is_case_sensitive_sorting)
            : [],
        },
      });
      if (pluck_object) {
        query.join(created_by_join).join(updated_by_join);
      }
      const { total_count: totalCount = 1, data: items } =
        await query.execute();

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          updated_by,
          ...rest
        } = item;
        return {
          ...entity_data,
          ...rest,
          created_by: created_by
            ? `${created_by.first_name} ${created_by.last_name}`
            : null,
          updated_by: updated_by
            ? `${updated_by.first_name} ${updated_by.last_name}`
            : null,
        };
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);
      return {
        totalCount, // Total number of users
        items: formatted_items, // Paginated users
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
      if (activeTab) return activeTab;
    }
    const gridTabFilterList = (await ctx.redisClient.getCachedData(
      _tabMenuId,
    )) as ITabGrid[];
    if (!gridTabFilterList) return [];
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
        sorting: z.array(
          z.object({
            id: z.string(),
            desc: z.boolean(),
            sort_key: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sorting } = input;
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      if (!["grid", "record"].includes(application ?? "") || !mainEntity)
        return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: "sorting" })) ?? "";
      if (!cached_id) return;
      return await ctx.redisClient.cacheData(cached_id, sorting);
    }),
  updateReportFilter: privateProcedure
    .input(
      z.object({
        filters: z.array(
          z.object({
            type: z.string(),
            field: z.string().optional(),
            entity: z.string().optional(),
            operator: z.string(),
            values: z.array(z.string()).optional(),
            id: z.string().optional(),
            label: z.string().optional(),
            default: z.boolean().optional(),
            display_value: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filters } = input;
      const headerList = headers();

      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      if (!["grid", "record"].includes(application ?? "") || !mainEntity)
        return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: "filter" })) ?? "";
      if (!cached_id) return;
      return await ctx.redisClient.cacheData(cached_id, filters);
    }),
  updateReportPagination: privateProcedure
    .input(
      z.object({
        current_page: z.number(),
        limit_per_page: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { current_page, limit_per_page } = input;
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      if (!["grid", "record"].includes(application ?? "") || !mainEntity)
        return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: "pagination" })) ?? "";
      if (!cached_id) return;
      return await ctx.redisClient.cacheData(cached_id, {
        current_page,
        limit_per_page,
      });
    }),
  getReportCachedData: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";
    const [, , mainEntity, application] = pathName.split("/");
    if (!["grid", "record"].includes(application ?? "") || !mainEntity)
      return [];
    const cacheTypes: TReportDataType[] = [
      "filter",
      "sorting",
      "pagination",
      "grid_tabs",
    ];
    const cacheIds = await Promise.all(
      cacheTypes.map((type) => gridCacheId({ context: ctx, type })),
    );

    const [filters, sorting, pagination, gridTabs] = await Promise.all(
      cacheIds
        .map((id) => (id ? ctx.redisClient.getCachedData(id) : null))
        .filter(Boolean),
    );

    const gridReports = Array.isArray(gridTabs) ? gridTabs : [];
    const cachedFilters: ISearchItem[] = Array.isArray(filters) ? filters : [];
    const reportSorting: SortingState = Array.isArray(sorting) ? sorting : [];
    const reportPagination: IPagination =
      typeof pagination === "object" ? pagination : {};
    const defaultFilters =
      gridReports?.find((report) => report.current)?.default_filter ?? [];
    const reportFilters = cachedFilters?.length
      ? cachedFilters
      : (defaultFilters as ISearchItem[]);
    const advanceFilter = reportFilters?.map(
      ({ entity, operator, type, field, values }) => ({
        entity,
        operator,
        type,
        field,
        values,
      }),
    ) as IAdvanceFilter[];

    return {
      filters: {
        advanceFilter,
        reportFilters,
        defaultFilters,
      },
      sorting: reportSorting,
      pagination: reportPagination,
    };
  }),
  updateGridTabs: privateProcedure
    .input(
      z.object({
        href: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get("x-pathname") || "";
      const [, , mainEntity, application] = pathName.split("/");
      if (application !== "grid" || !mainEntity) return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: "grid_tabs" })) ?? "";
      if (!cached_id) return;
      const cachedReportTabs = await ctx.redisClient.getCachedData(cached_id);
      const reportTabs = Array.isArray(cachedReportTabs)
        ? cachedReportTabs
        : [];
      const updatedTabs = reportTabs?.map((tab) => ({
        ...tab,
        current: tab.href === input.href,
      }));
      await ctx.redisClient.cacheData(cached_id, updatedTabs);
      return updatedTabs;
    }),
  getGridTabs: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const pathName = headerList.get("x-pathname") || "";
    const [, , mainEntity, application] = pathName.split("/");
    if (application !== "grid" || !mainEntity) return [];
    const cached_id =
      (await gridCacheId({ context: ctx, type: "grid_tabs" })) ?? "";
    if (!cached_id) return;
    const cachedReportTabs = await ctx.redisClient.getCachedData(cached_id);
    const reportTabs = Array.isArray(cachedReportTabs) ? cachedReportTabs : [];
    return reportTabs;
  }),
});

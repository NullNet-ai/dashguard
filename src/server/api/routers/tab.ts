import { EOperator, EOrderDirection } from "@dna-platform/common-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const tabRouter = createTRPCRouter({
  insertMainTabs: privateProcedure
    .input(
      z.array(
        z.object({
          name: z.string().min(1),
          href: z.string().min(1),
          current: z.boolean(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `main-tabs:${ctx.session.account.contact?.id}`;
      const response = await tabs
        .cacheData(key, input, 90000000)
        .then(() => {
          return "Ok";
        })
        .catch((e) => {
          console.error("@ ERROR", e);
          return null;
        });

      return response;
    }),
  getMainTabs: privateProcedure.query(async ({ ctx }) => {
    const tabs = ctx.redisClient;
    const key = `main-tabs:${ctx.session.account.contact?.id}`;
    const response = await tabs
      .getCachedData(key)
      .then((res) => {
        return res || [];
      })
      .catch(() => {
        return [];
      });

    return response;
  }),
  insertSubTabs: privateProcedure
    .input(
      z.object({
        current_context: z.string().min(1),
        tabs: z.array(
          z.object({
            name: z.string().min(1),
            href: z.string().min(1),
            current: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`;
      const response = await tabs
        .cacheData(key, input, 90000000)
        .then(() => {
          return "Ok";
        })
        .catch((e) => {
          console.error("@ ERROR", e);
          return null;
        });

      return response;
    }),
  getSubTabs: privateProcedure
    .input(
      z.object({
        current_context: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`;
      const response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        });

      return response;
    }),

  closeCurrentClassTab: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `main-tabs:${ctx.session.account.contact?.id}`;
      const response = (await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        })) as {
        href: string;
      }[];

      const tab = response?.find((tab) => tab.href === input.href);
      const index = response?.findIndex((tab) => tab.href === input.href);

      if (tab) {
        response?.splice(index, 1);
      }

      await tabs.cacheData(key, response, 90000000);

      // return left tab
      return response?.[index - 1];
    }),
  closeAllClassTabs: privateProcedure.mutation(async ({ input, ctx }) => {
    const tabs = ctx.redisClient;
    const key = `main-tabs:${ctx.session.account.contact?.id}`;
    const response = await tabs
      .getCachedData(key)
      .then((res) => {
        return res || [];
      })
      .catch(() => {
        return [];
      });

    const update_tabs = response?.filter(
      (tab: any) => tab.name === "dashboard",
    );
    await tabs.cacheData(key, update_tabs, 90000000);
  }),

  closeOtherClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `main-tabs:${ctx.session.account.contact?.id}`;
      const response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        });

      const update_tabs = response?.filter(
        (tab: any) => tab.name === "dashboard" || tab.href === input.href,
      );

      await tabs.cacheData(key, update_tabs, 90000000);
    }),
  closeCurrentInnerClassTab: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`;
      let response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        });

      const update_tabs = response?.tabs?.filter(
        (tab: Record<string, any>) => tab.href !== input.href,
      );

      response = {
        ...response,
        tabs: update_tabs,
      };

      await tabs.cacheData(key, response, 90000000);
    }),

  closeAllInnerClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`;
      let response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        });

      const update_tabs = response?.tabs?.filter(
        (tab: Record<string, any>) => tab.name === "Grid",
      );

      response = {
        ...response,
        tabs: update_tabs,
      };

      await tabs.cacheData(key, response, 90000000);
    }),

  closeOtherInnerClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient;
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`;
      let response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || [];
        })
        .catch(() => {
          return [];
        });

      const update_tabs = response?.tabs?.filter(
        (tab: Record<string, any>) =>
          tab.name === "Grid" || tab.href === input.href,
      );

      response = {
        ...response,
        tabs: update_tabs,
      };

      await tabs.cacheData(key, response, 90000000);
    }),
});

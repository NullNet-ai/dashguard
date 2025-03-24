import { headers } from 'next/headers'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const tabRouter = createTRPCRouter({
  insertMainTabs: privateProcedure
    .input(
      z.array(
        z.object({
          name: z.string().min(1),
          href: z.string().min(1),
          current: z.boolean(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `main-tabs:${ctx.session.account.contact?.id}`
      const response = await tabs
        .cacheData(key, input, 90000000)
        .then(() => {
          return 'Ok'
        })
        .catch((e) => {
          console.error('@ ERROR', e)
          return null
        })

      return response
    }),
  getMainTabs: privateProcedure.query(async ({ ctx }) => {
    const tabs = ctx.redisClient
    const key = `main-tabs:${ctx.session.account.contact?.id}`
    const response = await tabs
      .getCachedData(key)
      .then((res) => {
        return res || []
      })
      .catch(() => {
        return []
      })

    return response
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
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      const response = await tabs
        .cacheData(key, input, 90000000)
        .then(() => {
          return 'Ok'
        })
        .catch((e) => {
          console.error('@ ERROR', e)
          return null
        })

      return response
    }),
  updateAllSubTabs: privateProcedure
  .input(
    z.object({
      current_context: z.string().min(1),
      tabs: z.array(z.any()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const tabs = ctx.redisClient
    const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`

    const response = await tabs
      .cacheData(key, input, 90000000)
      .then(() => {
        return 'Ok'
      })
      .catch((e) => {
        console.error('@ ERROR', e)
        return null
      })

    return response
  }),
  updateAllMainTabs: privateProcedure
  .input(
    z.object({
      tabs: z.array(z.any()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const tabs = ctx.redisClient
    const key = `main-tabs:${ctx.session.account.contact?.id}`

    const response = await tabs
      .cacheData(key, input.tabs, 90000000)
      .then(() => {
        return 'Ok'
      })
      .catch((e) => {
        console.error('@ ERROR', e)
        return null
      })

    return response
  }),
  updateSubTabs: privateProcedure
    .input(
      z.object({
        current_context: z.string().min(1),
        tab_name: z.string().min(1),
        is_active: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      const response = await ctx.redisClient.getCachedData(key)

      // If we're setting a tab to active, ensure only one tab is active
      if (input.is_active) {
        const update_sub_tabs = response?.tabs?.map((tab: Record<string, any>) => ({
          ...tab,
          current: tab?.name === input.tab_name,
        }))

        await ctx.redisClient.cacheData(key, {
          current_context: input.current_context,
          tabs: update_sub_tabs,
        }, 90000000)
      }
    }),
  getSubTabs: privateProcedure
    .input(
      z.object({
        current_context: z.string().min(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      const response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || []
        })
        .catch(() => {
          return []
        })

      return response
    }),

  closeCurrentClassTab: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `main-tabs:${ctx.session.account.contact?.id}`
      const response = (await tabs
        .getCachedData(key)
        .then((res) => {
          return res || []
        })
        .catch(() => {
          return []
        })) as {
        href: string
      }[]

      const tab = response?.find(tab => tab.href === input.href)
      const index = response?.findIndex(tab => tab.href === input.href)

      if (tab) {
        response?.splice(index, 1)
      }

      await tabs.cacheData(key, response, 90000000)

      // return left tab
      return response?.[index - 1]
    }),
  closeAllClassTabs: privateProcedure.mutation(async ({ ctx }) => {
    const tabs = ctx.redisClient
    const key = `main-tabs:${ctx.session.account.contact?.id}`
    const response = await tabs
      .getCachedData(key)
      .then((res) => {
        return res || []
      })
      .catch(() => {
        return []
      })

    const update_tabs = response?.filter((tab: any) => tab.name === 'dashboard')
    await tabs.cacheData(key, update_tabs, 90000000)
  }),

  closeOtherClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `main-tabs:${ctx.session.account.contact?.id}`
      const response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || []
        })
        .catch(() => {
          return []
        })

      const update_tabs = response?.filter(
        (tab: any) => tab.name === 'dashboard' || tab.href === input.href
      )

      await tabs.cacheData(key, update_tabs, 90000000)
    }),
  closeCurrentInnerClassTab: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      let response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || []
        })
        .catch(() => {
          return []
        })

      const update_tabs = response?.tabs?.filter(
        (tab: Record<string, any>) => tab.href !== input.href
      )

      response = {
        ...response,
        tabs: update_tabs,
      }

      await tabs.cacheData(key, response, 90000000)
    }),

  closeAllInnerClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      let response = await tabs
        .getCachedData(key)
        .then((res) => {
          return res || []
        })
        .catch(() => {
          return []
        })

      const update_tabs = response?.tabs?.filter(
        (tab: Record<string, any>) => tab?.name === 'Grid'
      )

      response = {
        ...response,
        tabs: update_tabs,
      }

      await tabs.cacheData(key, response, 90000000)
    }),

  closeOtherInnerClassTabs: privateProcedure
    .input(
      z.object({
        href: z.string().min(1),
        current_context: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tabs = ctx.redisClient
      const key = `sub-tabs:${input.current_context}:${ctx.session.account.contact?.id}`
      let response = await tabs
        .getCachedData(key)
        .then(res => res || [])
        .catch(() => [])

      const update_tabs = response?.tabs?.filter((tab: any) => tab?.name === 'Grid' || tab?.href === input.href)

      response = {
        ...response,
        tabs: update_tabs,
      }

      await tabs.cacheData(key, response, 90000000)
    }),
  updateCurrentSubTab: privateProcedure
    .input(
      z.object({
        tab_name: z.string().min(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const headerList = headers()
      const pathName = headerList.get('x-pathname') || ''
      const [, portal, mainEntity] = pathName.split('/')
      const current_context = '/' + portal + '/' + mainEntity
      const key = `sub-tabs:${current_context}:${ctx.session.account.contact?.id}`

      const response = await ctx.redisClient.getCachedData(key)
      const isTabExist = response?.tabs?.find(
        (tab: any) => tab.name === input.tab_name
      )
      const tabs = response?.tabs?.map((tab: Record<string, any>) => {
        if (tab.current && !isTabExist) {
          return {
            ...tab,
            name: input.tab_name,
            href: tab.href.replace(tab.name, input.tab_name),
          }
        }
        return tab
      })

      await ctx.redisClient.cacheData(key, { current_context, tabs }, 90000000)
    }),
  updateMainTabs: privateProcedure
    .input(
      z.object({
        tab_name: z.string().min(1),
        is_active: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const key = `main-tabs:${ctx.session.account.contact?.id}`
      const response = await ctx.redisClient.getCachedData(key)
      const update_tabs = response?.map((tab: Record<string, any>) => {
        if (tab.name === input.tab_name) {
          return {
            ...tab,
            current: input.is_active,
          }
        }
        return {
          ...tab,
          current: false,
        }
      })
      await ctx.redisClient.cacheData(key, update_tabs, 90000000)
    }),
})

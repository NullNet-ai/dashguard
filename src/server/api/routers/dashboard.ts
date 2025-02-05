import { groupBy } from 'lodash'
import { z } from 'zod' // Zod is used for input validation

import entities from '~/auto-generated/entities'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

const LIMIT = 20

export const dashboardRouter = createTRPCRouter({
  getEntityCountGroupByStatus: privateProcedure.input(z.object({
    entity: z.string().refine(
      (value) => {
        return entities.includes(value)
      }, {
        message: 'Invalid entity name. It must be one of the DnaOrm models.',
      },
    ),
  })).query(async ({ ctx, input }) => {
    const getAll = async (
      start: number,
      total_count: number | null,
      previous_items: { id: string, status: string }[]): Promise<{ total_count: number | null, items: { id: string, status: string }[] }> => {
      if (total_count === null || start <= total_count) {
        const { total_count: newTotalCount, data: items } = await ctx.dnaClient
          .findAll({
            entity: input?.entity,
            token: ctx.token.value,
            query: {
              pluck: ['id', 'status'],
              advance_filters: [],
              order: {
                starts_at: start,
                limit: LIMIT,
              },
            },
          })
          .execute()
        // @ts-expect-error - Need to update type of total_count to number
        const response = await getAll(start + LIMIT, newTotalCount ?? total_count, [...previous_items, ...items])
        return response
      }
      return {
        total_count,
        items: previous_items,
      }
    }
    const { items } = await getAll(0, null, [])
    const grouped_items = groupBy(items, 'status')
    return grouped_items
  }),
})

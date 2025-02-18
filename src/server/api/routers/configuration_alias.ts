import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'
const entity = 'device_aliases'
export const deviceAliasRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  mainGrid: privateProcedure
    // Define input using zod for validation
    .input(ZodItems.extend({
      device_id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
        device_id,
      } = input

      const device_configuration = await ctx.dnaClient.findAll({
        entity: 'device_configurations',
        token: ctx.token.value,
        query: {
          pluck: ['id', 'created_date', 'timestamp'],
          advance_filters: [
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'device_configurations',
              operator: EOperator.EQUAL,
              values: [device_id],
            },
          ],
          order: {
            limit: 1,
            // by_field: 'timestamp',
            // by_direction: EOrderDirection.DESC,
          },
          multiple_sort: [
            {
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
            {
              by_field: 'created_time',
              by_direction: EOrderDirection.DESC,
            },
          ],
        },

      }).execute()

      const device_conf_id = device_configuration?.data?.[0]?.id as string

      const device_aliases = await ctx.dnaClient
        .findAll({
          entity: 'device_aliases',
          token: ctx.token.value,
          query: {
            track_total_records: true,
            pluck,
            advance_filters: _advance_filters?.length
              ? _advance_filters as IAdvanceFilters[]
              : createAdvancedFilter({
                device_configuration_id: device_conf_id,
                status: 'Active',
              }) as IAdvanceFilters[],
            order: {
              starts_at:
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100)
                    - (input.limit || 100),
              limit: input.limit || 1,
              by_field: 'code',
              by_direction: EOrderDirection.DESC,
            },
            multiple_sort: input.sorting?.length
              ? formatSorting(input.sorting)
              : [],
          },
        })
        .execute()

      const { total_count: totalCount = 1, data: items }
      = device_aliases

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          created_by: 'Wallguard Client',
          updated_by: 'Wallguard Client',
        }
      })

      const totalPages = Math.ceil(formatted_items?.length / limit)

      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),
})

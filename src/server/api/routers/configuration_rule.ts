import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'
const entity = 'device_rules'
export const deviceRuleRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  mainGrid: privateProcedure
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
      } = input

      const pluck_object = {
        device_rules: pluck as string[],
        device_configurations: [
          'id',
          'device_id',
          'raw_content',
        ],
      }

      const device_rules = await ctx.dnaClient.findAll({
        entity: 'device_rules',
        token: ctx.token.value,
        query: {
          pluck_object,
          advance_filters: _advance_filters as IAdvanceFilters[],
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'device_configurations',
              field: 'id',
            },
            from: {
              entity: 'device_rules',
              field: 'device_configuration_id',
            },
          },
        })
        .execute()

      const { total_count: totalCount = 1, data: items }
      = device_rules

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

      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),

})

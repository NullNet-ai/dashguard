import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'
const entity = ''
export const deviceAliasRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  mainGrid: privateProcedure
  // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
      } = input

      const pluck_object = {
        device_aliases: pluck,
        contacts: ['first_name', 'last_name', 'id'],
        organization_accounts: ['contact_id', 'id'],
        
      }

      const device_aliases = await ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          // pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
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
      // .join({
      //   type: 'left',
      //   field_relation: {
      //     to: {
      //       entity: 'organization_accounts',
      //       field: 'id',
      //     },
      //     from: {
      //       entity,
      //       field: 'created_by',
      //     },
      //   },
      // })
      // .join({
      //   type: 'left',
      //   field_relation: {
      //     to: {
      //       entity: 'contacts',
      //       field: 'id',
      //     },
      //     from: {
      //       entity: 'organization_accounts',
      //       field: 'contact_id',
      //     },
      //   },
      // })
        .execute()

      const { total_count: totalCount = 1, data: items }
      = device_aliases

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          updated_by,
          contacts,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          created_by: contacts?.length
            ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
            : null,
          updated_by: updated_by?.length
            ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
            : null,
        }
      })

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),
})

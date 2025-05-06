import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import { createRemoteAccess } from '~/app/api/device_remote_access_session/create_remote_access'
import { disconnectRemoteAccess } from '~/app/api/device_remote_access_session/disconnect_remote_access'
import { getRemoteAccess } from '~/app/api/device_remote_access_session/get_remote_access'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { formatString } from '~/server/utils/formatString'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

const entity = 'resolutions'

export const resolutionsRouter = createTRPCRouter({
  fetchResolutions: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit } = input

      const res = await ctx.dnaClient
      .findAll({
        entity,
        token: ctx.token.value,
        query: {
          pluck: ['id', 'resolution_type'],
          advance_filters: createAdvancedFilter({ status: 'Active' }),
          order: {
            limit: limit || 10,
            by_field: 'created_date',
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute()

      if (!res?.data?.length) {
        return []
      }
      
      return res?.data?.map((item) => {
        return {
          label: item.resolution_type,
          value: item.resolution_type,
        }
      })
    }
    ),

  createResolution: privateProcedure
    .input(z.object({ resolution_type: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = ctx.token.value
      const { resolution_type } = input
        const res = await ctx.dnaClient.create({
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              resolution_type,
              entity_prefix: 'RT'
            },
          },
        }) 
        .execute()

        return {
            label: resolution_type,
            value: res?.data?.[0]?.id,
          }
       
    }),
  

})

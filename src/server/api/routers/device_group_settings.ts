import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
import { EStatus } from '../types'

export const deviceGroupSettingsRouter = createTRPCRouter({
  ...createDefineRoutes('device_group_settings'),
  createDeviceGroupSettings: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        fieldIdentifier: z.string(),
        data: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const record = await ctx.dnaClient
          .create({
            entity: 'device_group_settings',
            token: ctx.token.value,
            mutation: {
              params: {
                ...input.data,
                entity_prefix: 'DGS',
                status: EStatus.ACTIVE,
              },
              pluck: ['id', input.fieldIdentifier],
            },
          })
          .execute()

        const result = record?.data?.[0]

        return result
          ? {
              value: result?.id,
              label: result?.[input.fieldIdentifier],
            }
          : null
      }
      catch (error) {
      }
    }),
  getDeviceGroupSettings: privateProcedure.query(async ({ ctx }) => {
    const filter = async ({
      entity,
      pluck,
      advance_filters,
      limit,
    }: {
      entity: string
      pluck: string[]
      advance_filters: IAdvanceFilters<string | number>[]
      limit?: number
    }) => {
      return await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters,
            distinct_by: "status",
            // order: {
            //   limit: limit || 100,
            //   by_field: 'created_date',
            //   by_direction: EOrderDirection.DESC,
            // },
          
            multiple_sort: [
              {
                  "by_field": "devices.status",
                  "by_direction": EOrderDirection.ASC
              }
          ] 
          },
        })
        .execute()
    }
    const device_group_settings = await filter({
      entity: 'device_group_settings',
      pluck: ['id', 'name'],
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: ['Active'],
        },
      ],
    })

    return device_group_settings.data?.map((item) => {
      const { id, name } = item
      return {
        value: id,
        label: name,
      }
    })
  }),
})

// import z from "zod";
import { EOperator, EOrderDirection } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
  // privateProcedure
} from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
const entity = 'device_configurations'
export const deviceConfigurationRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  fetchDeviceRawData: privateProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              device_configurations: [
                'id',
                'device_id',
                'raw_content',
                'status',
              ],
              devices: [
                'id', 'code',
              ],
            },
            advance_filters: [{
              type: 'criteria',
              field: 'code',
              entity: 'devices',
              operator: EOperator.EQUAL,
              values: [
                input.code,
              ],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'status',
              entity: 'device_configurations',
              operator: EOperator.EQUAL,
              values: [
                'Active',
              ],
            }],
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'devices',
              field: 'id',
            },
            from: {
              entity,
              field: 'device_id',
            },
          },
        })
        .execute()

      const raw_content = res?.data?.[0]?.raw_content

      const decodedString = raw_content ? atob(raw_content) : ''

      return decodedString
    }),

})

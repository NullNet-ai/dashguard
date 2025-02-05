import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'

import { createDefineRoutes } from '../baseCrud'

export const countryRouter = createTRPCRouter({
  ...createDefineRoutes('country'),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        country: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const country = await ctx.dnaClient
        .findAll({
          entity: 'country',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'status'],
            advance_filters: createAdvancedFilter({ country: input.country }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      if (country.data.length > 0 && country?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = country?.data[0] || {}
        return {
          message: 'Country already exists',
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          existing: true,
          existing_record: {
            id: existing_id,
            status,
          },
          errors: {
            form: [
              {
                field: 'country',
                message: 'Country already exists.',
              },
            ],
          },
        }
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: 'country',
          token: ctx.token.value,
          mutation: {
            params: {
              country: input.country,
            },
          },
        })
        .execute()

      return res
    }),
  // aggregatePackets: privateProcedure.query(async ({ ctx }) => {
  //   const filter = async ({
  //     entity,
  //     pluck,
  //     advance_filters,
  //     limit,
  //   }: {
  //     entity: string
  //     pluck: string[]
  //     advance_filters: IAdvanceFilters<string | number>[]
  //     limit?: number
  //   }) => {
  //     return await ctx.dnaClient
  //       .findAll({
  //         entity,
  //         token: ctx.token.value,
  //         query: {
  //           pluck,
  //           advance_filters: [
  //             {
  //               type: 'criteria',
  //               field: 'timestamp',
  //               entity: 'packets',
  //               operator: EOperator.IS_BETWEEN,
  //               values: [
  //                 '2025-02-05 04:00:00+00',
  //                 '2025-02-05 04:00:20+00',
  //                 '2025-02-05 04:00:40+00',
  //                 '2025-02-05 04:01:00+00',
  //                 '2025-02-05 04:01:20+00',
  //                 '2025-02-05 04:01:40+00',
  //               ],
  //             },
  //           ],
  //           // joins: [],
  //           aggregations: [
  //             {
  //               aggregation: 'count',
  //               aggregate_on: 'id',
  //               bucket_name: 'count',
  //             },
  //           ],
  //           order: {
  //             limit: 100,
  //             by_field: 'bucket',
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           bucket_size: '20s',
  //         },
  //       })
  //       .execute()
  //   }

    // return country_options.data?.map((item) => {
    //   const { id, country } = item;
    //   return {
    //     value: id,
    //     label: country,
    //   };
    // });
  })

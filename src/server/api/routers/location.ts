import { EOperator } from '@dna-platform/common-orm';
import { z } from 'zod';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';

/**
 *
 * @privateProcedure - Has access to the session
 *
 */

/**
 *
 * @publicProcedure - Does not have access to the session
 *
 */

const ENTITY = 'location';

export const locationRouter = createTRPCRouter({
  saveLocationAddress: privateProcedure
    .input(
      z.object({
        id: z.string(),
        address_id: z.string(),
        details: z.object({
          address: z.string().optional(),
          address_line_one: z.string().optional(),
          address_line_two: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          place_id: z.string().optional(),
          street_number: z.string().optional(),
          street: z.string().optional(),
          region: z.string().optional(),
          region_code: z.string().optional(),
          country_code: z.string().optional(),
          postal_code: z.string().optional(),
          country: z.string().optional(),
          state: z.string().optional(),
          city: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, address_id, details = {}, ...rest } = input;

      const record = await ctx.dnaClient
        .create({
          entity: 'address',
          token: ctx.token.value,
          mutation: {
            params: { 
              id: address_id,
              ...details
            },
            pluck: ['id'],
          },
        })
        .execute();

      if (!record?.success) {
        throw new Error('Address not created');
      }

      return ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: { ...rest, address_id: record?.data?.[0]?.id },
            pluck: ['id', 'address_id'],
          },
        })
        .execute();
    }),

  getLocationAddress: privateProcedure
    .input(
      z.object({
        id: z.string(),
        main_entity: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const recordByCode = await ctx.dnaClient
        .findByCode(input.id, {
          entity: input.main_entity,
          token: ctx.token.value,
          query: {
            pluck: ['id'],
          },
        })
        .execute();
      const { data, ...rest } = recordByCode ?? {};

      const record = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'id',
                operator: EOperator.EQUAL,
                values: [data?.[0]?.id],
              },
            ],
            pluck_object: {
              locations: ['id', 'address_id'],
              addresses: [
                'id',
                'address',
                'address_line_one',
                'address_line_two',
                'latitude',
                'longitude',
                'place_id',
                'street_number',
                'street',
                'region',
                'region_code',
                'country_code',
                'postal_code',
                'country',
                'state',
                'city',
              ],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'addresses',
              field: 'id',
            },
            from: {
              entity: 'locations',
              field: 'address_id',
            },
          },
        })
        .execute();

      return record;
    }),
});

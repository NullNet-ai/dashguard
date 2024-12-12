import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";

import { z } from "zod";
import { PhoneSchema } from "../../zodSchema/contact/basicDetails";
import { TRPCError } from "@trpc/server";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
const entity = "contact_phone_number";

export const contactPhoneNumberRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  createPhoneNumber: privateProcedure
    .input(
      PhoneSchema.extend({
        contact_id: z.string(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity,
          token: ctx.token.value,
          mutation: {
            params: input,
            pluck: ["id"],
          },
        })
        .execute();

      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${entity} creation failed`,
        });
      }
      console.info("[Create Draft]", record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  archivedPhoneNumber: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const record = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              is_primary: false,
              status: "Archived",
            },
            pluck: ["id"],
          },
        })
        .execute();

      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${entity} archived failed`,
        });
      }
      console.info("[Archived data]", record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  getPhoneNumbersByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        status: z.string().optional(),
        pluck_fields: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        contact_id,
        pluck_fields = [
          "id",
          "raw_phone_number",
          "iso_code",
          "country_code",
          "is_primary",
        ],
        status,
      } = input;

      const advance_filters = createAdvancedFilter({
        contact_id,
        ...(status && { status }),
      });

      const response = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
            advance_filters,
          },
        })
        .execute();

      return response.data || [];
    }),
  updatePhoneNumber: privateProcedure
    .input(
      PhoneSchema.extend({ id: z.string(), status: z.string().optional() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest_input } = input;
      const record = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: rest_input,
            pluck: ["id"],
          },
        })
        .execute();

      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${entity} update failed`,
        });
      }
      console.info("[Updated data]", record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
});

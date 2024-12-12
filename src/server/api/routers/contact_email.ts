import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";

import { z } from "zod";
import { EmailSchema } from "../../zodSchema/contacts/basicDetails";
import { TRPCError } from "@trpc/server";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
const entity = "contact_email";

export const contactEmailRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  createContactEmail: privateProcedure
    .input(EmailSchema.extend({ status: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity,
          token: ctx.token.value,
          mutation: {
            params: input,
            pluck: ["id", "code"],
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
  getEmailsByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()).optional(),
        status: z.string().optional(),
        advance_filters: z
          .object({
            is_primary: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        contact_id,
        pluck_fields = ["id", "email", "is_primary"],
        status,
        advance_filters: custom_advance_filter = {},
      } = input;

      const advance_filters = createAdvancedFilter({
        contact_id,
        ...(status && { status }),
        ...custom_advance_filter,
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
  updateContactEmail: privateProcedure
    .input(
      EmailSchema.extend({ id: z.string(), status: z.string().optional() }),
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
  archivedEmail: privateProcedure
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
});

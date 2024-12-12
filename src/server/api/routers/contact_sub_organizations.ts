import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { TRPCError } from "@trpc/server";

const ENTITY = "contact_sub_organization";

export const contactSubOrganizationRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateSubOrganizationRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
        contact_id: z.string(),
        job_title: z.string(),
        sub_organization_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sub_organization_id, contact_id } = input;
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Active",
              job_title: input.job_title,
              sub_organization_id: sub_organization_id || null,
              contact_id,
            },
          },
        })
        .execute();

      return res;
    }),
  createSubOrganizationRecord: privateProcedure
    .input(
      z.object({
        job_title: z.string(),
        contact_id: z.string(),
        sub_organization_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sub_organization_id, job_title, contact_id } = input;
      const res = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Active",
              contact_id,
              job_title,
              sub_organization_id: sub_organization_id || null,
            },
          },
        })
        .execute();

      return res;
    }),

  getSubOrganizationByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {} } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        contact_id: input.contact_id,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return res?.data;
    }),
  archivedSubOrganizationsRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const record = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Archived",
            },
            pluck: ["id"],
          },
        })
        .execute();

      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${ENTITY} archived failed`,
        });
      }
      console.info("[Archived data]", record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
});

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { EOperator } from "@dna-platform/common-orm";
import { pick } from "lodash";

const ENTITY = "booking_participant";

export const bookingParticipantsRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateBookingParticipantsRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
        booking_id: z.string().optional(),
        assignment: z.string().optional(),
        contact_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { booking_id, assignment, contact_id, id } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Active",
              booking_id,
              assignment,
              contact_id,
            },
          },
        })
        .execute();

      return res;
    }),
  updateFeedback: privateProcedure
    .input(
      z.object({
        id: z.string({ message: "ID is required." }),
        overall_result: z.string().optional(),
        rating: z.string().optional(),
        strength: z.string().optional(),
        weakness: z.string().optional(),
        red_flag: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { overall_result, rating, strength, weakness, red_flag, id } =
        input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              overall_result,
              rating,
              strength,
              weakness,
              red_flag,
            },
          },
        })
        .execute();

      return res;
    }),
  createBookingParticipantsRecord: privateProcedure
    .input(
      z.object({
        booking_id: z.string().optional(),
        assignment: z.string().optional(),
        contact_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { assignment, contact_id, booking_id } = input;
      const res = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Active",
              booking_id,
              assignment,
              contact_id,
            },
            pluck: ["id"],
          },
        })
        .execute();

      return res;
    }),
  fetchAllContact: privateProcedure
    .input(
      z.object({
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {}, pluck_fields } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        status: "Active",
      }) as any[];
      _advance_filters.push({
        type: "operator",
        operator: EOperator.AND,
      });
      _advance_filters.push({
        type: "criteria",
        field: "id",
        operator: EOperator.NOT_EQUAL,
        // ! TODO ENV
        values: ["01JCSAG79KQ1WM0F9B47Q700P1"],
      });

      const res = await ctx.dnaClient
        .findAll({
          entity: "contact",
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: pluck_fields,
          },
        })
        .execute();

      return res.data || [];
    }),
  getParticipantsByBookingId: privateProcedure
    .input(
      z.object({
        booking_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {}, pluck_fields, booking_id } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        booking_id,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: pluck_fields,
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact",
              field: "id",
            },
            from: {
              entity: ENTITY,
              field: "contact_id",
            },
          },
        })
        .execute();
      const data = res.data || [];

      const formatted_data = data?.map((item: any) => {
        const { booking_participants, contacts } = item || {};
        const participants = pick(booking_participants, pluck_fields);

        return {
          ...participants,
          contact:
            `${contacts?.first_name || ""} ${contacts?.middle_name || ""} ${contacts?.last_name || ""}`?.trim(),
        };
      });

      return formatted_data;
    }),
  getParticipantsByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {}, pluck_fields, contact_id } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        contact_id,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: pluck_fields,
          },
        })
        .execute();

      return res.data || [];
    }),
});

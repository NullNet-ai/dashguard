import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { scheduleSchema } from "~/server/zodSchema/bookings/scheduleSchema";
import moment from "moment-timezone";
import { pick } from "lodash";
import { EOrderDirection, IAdvanceFilters } from "@dna-platform/common-orm";
import ZodItems from "~/server/zodSchema/grid/items";

const ENTITY = "booking";

export const bookingsRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateBookingCandidateRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
        candidate_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { candidate_id, id } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              candidate_id,
            },
          },
        })
        .execute();

      return res;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        interview_notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest_input } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: rest_input,
          },
        })
        .execute();

      return res;
    }),
  getBooking: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()).optional(),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = { status: "Active" } } = input;

      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        id: input.id,
      });

      const res = await ctx.dnaClient
        .findOne(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      const [booking] = res?.data || [];

      if (!booking) return null;
      return booking;
    }),
  updateBookingsWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: "bookings",
          token: ctx.token.value,
          mutation: {
            params: {
              tags,
            },
          },
        })
        .execute();
    }),
  updateBookingSchedule: privateProcedure
    .input(
      scheduleSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const {
        start_date,
        start_time = "",
        duration_mins = 120,
        timezone = "",
      } = rest;

      // Ensure start_time is in a valid format (e.g., HH:mm:ss)
      const validStartTime = /^\d{2}:\d{2}(:\d{2})?$/.exec(start_time)
        ? start_time
        : "00:00:00";

      // Combine start_date and start_time into a single moment object in the specified timezone
      const startDateTime = moment.tz(
        `${start_date}T${validStartTime}`,
        timezone!,
      );

      // Add the duration in minutes to the moment object
      const endDateTime = startDateTime.clone().add(duration_mins, "minutes");

      // Extract the end_date and end_time from the resulting moment object
      const end_date = endDateTime.format("YYYY-MM-DD");
      const end_time = endDateTime.format("HH:mm:ss");

      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: { ...rest, end_date, end_time },
          },
        })
        .execute();

      return res;
    }),
  mainGrid: privateProcedure.input(ZodItems).query(async ({ ctx, input }) => {
    const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
      .findAll({
        entity: ENTITY,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          advance_filters: input?.advance_filters as IAdvanceFilters[],
          order: {
            starts_at: 0,
            limit: input.limit || 1,
            by_field: "created_date",
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .join({
        type: "left",
        field_relation: {
          to: {
            entity: "candidate",
            field: "id",
          },
          from: {
            entity: "booking",
            field: "candidate_id",
          },
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
            entity: "candidate",
            field: "contact_id",
          },
        },
      })
      .execute();

    //TODO: Transform the data - temporary
    const formatted_items = items.reduce(
      (acc: Record<string, string>[], item) => {
        const { bookings, contacts } = item;
        const candidate = pick(contacts, [
          "first_name",
          "last_name",
          "middle_name",
        ]);

        const existing_booking = acc?.find(
          (acc_item: any) => acc_item?.id === bookings?.id,
        );

        if (existing_booking) return acc;

        return [
          ...acc,
          {
            ...bookings,
            ...candidate,
            candidate:
              `${candidate?.first_name || ""} ${candidate.middle_name || ""} ${candidate?.last_name || ""}`?.trim(),
          },
        ];
      },
      [],
    );
    // ! JOIN AVAILABLE KINDLY USE and Transform the data ( Map Reduce)
    const totalPages = Math.ceil(totalCount / 100);

    return {
      totalCount, // Total number of users
      items: formatted_items, // Paginated users
      currentPage: 0, // The current page
      totalPages, // Total number of pages
    };
  }),
});

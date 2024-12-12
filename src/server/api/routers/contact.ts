import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import ZodItems from "~/server/zodSchema/grid/items";
import { EOperator, IAdvanceFilters } from "@dna-platform/common-orm";
import { formatSorting } from "~/server/utils/formatSorting";
import { pick } from "lodash";

const ENTITY = "contact";

export const contactRouter = createTRPCRouter({
  updateBasiDetails: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: input.main_entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  mainGrid: privateProcedure.input(ZodItems).query(async ({ ctx, input }) => {
    const hasAdvanceFilters = input?.advance_filters?.length
      ? [
          {
            type: "operator",
            operator: EOperator.AND,
          },
          ...(input?.advance_filters ?? []),
        ]
      : [...(input?.advance_filters ?? [])];

    const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
      .findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          advance_filters: [
            // {
            //   type: "criteria",
            //   field: "id",
            //   operator: EOperator.NOT_EQUAL,
            //   // ! TODO ENV
            //   values: ["01JCSAG79KQ1WM0F9B47Q700P1"],
            // },
            ...hasAdvanceFilters,
          ] as IAdvanceFilters[],
          order: {
            starts_at:
              // current 5 *  input.limit 50 = 250
              (input.current || 0) === 0
                ? 0
                : (input.current || 1) * (input.limit || 100) -
                  (input.limit || 100),
            limit: input.limit || 1,
            // by_field: "created_date",
            // by_direction: EOrderDirection.ASC,
          },
          multiple_sort: input.sorting?.length
            ? formatSorting(input.sorting)
            : [],
        },
      })
      .join({
        type: "left",
        field_relation: {
          to: {
            entity: "contact_email",
            field: "contact_id",
          },
          from: {
            entity: ENTITY,
            field: "id",
          },
        },
      })
      .join({
        type: "left",
        field_relation: {
          to: {
            entity: "contact_phone_number",
            field: "contact_id",
          },
          from: {
            entity: ENTITY,
            field: "id",
          },
        },
      })
      .execute();

    //TODO: Transform the data - temporary
    const formatted_items = items.reduce(
      (acc: Record<string, string>[], item) => {
        const { contacts, contact_emails, contact_phone_numbers } = item;
        const emails = pick(contact_emails, ["email"]);
        const phones = pick(contact_phone_numbers, [
          "raw_phone_number",
          "iso_code",
          "country_code",
        ]);
        const existing_contact = acc?.find(
          (acc_item: any) => acc_item?.id === contacts?.id,
        );

        if (existing_contact) return acc;

        return [
          ...acc,
          {
            ...contacts,
            ...emails,
            ...phones,
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

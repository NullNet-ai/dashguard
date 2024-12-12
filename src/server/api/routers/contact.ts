import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import ZodItems from "~/server/zodSchema/grid/items";
import {
  EOperator,
  EOrderDirection,
  IAdvanceFilters,
} from "@dna-platform/common-orm";
import { formatSorting } from "~/server/utils/formatSorting";
import { pick } from "lodash";
import { ContactCategoryDetailsSchema } from "~/server/zodSchema/contact/categoryDetails";
import { ContactPhoneEmailSchema } from "../../zodSchema/contact/contactPhoneEmail";
import { EStatus } from "../types";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";

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
  updateCategoryDetails: privateProcedure
    .input(
      ContactCategoryDetailsSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { categories } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              categories: [...new Set([categories, "Contact"])],
            },
          },
        })
        .execute();
    }),
  updateContactPhoneEmail: privateProcedure
    .input(ContactPhoneEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, email, phone } = input;

      let contact_id = id;
      let contact_code = "";
      if (!contact_id) {
        const record = await ctx.dnaClient
          .create({
            entity: "contact",
            token: ctx.token.value,
            mutation: {
              params: {
                status: "Draft",
              },
              pluck: ["id", "code"],
            },
          })
          .execute();
        contact_id = record?.data?.[0]?.id;
        contact_code = record?.data?.[0]?.code;
      }

      const insert = async (entity: string, data: any, pluck: string[]) => {
        const record = await ctx.dnaClient
          .create({
            entity,
            token: ctx.token.value,
            mutation: {
              params: { ...data, contact_id, status: "Active" },
              pluck,
            },
          })
          .execute();
        return record?.data?.[0];
      };

      const response = await Promise.all([
        insert("contact_email", email?.[0], [
          "email",
          "id",
          "contact_id",
          "is_primary",
        ]),
        insert("contact_phone_number", phone?.[0], [
          "raw_phone_number",
          "id",
          "contact_id",
          "is_primary",
          "iso_code",
          "country_code",
        ]),
      ]);
      console.info("[Insert Contact Phone Email]", response);

      return {
        data: {
          id: contact_id,
          code: contact_code,
          email: [response[0]],
          phone: [response[1]],
        },
      };
    }),
  fetchContactPhoneEmail: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
        .findAll({
          entity: input.main_entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
            pluck_object: {
              contact_emails: ["email", "is_primary"],
              contact_phone_numbers: [
                "raw_phone_number",
                "iso_code",
                "country_code",
                "is_primary",
              ],
              contacts: input.pluck_fields,
            },
            advance_filters: [
              {
                field: "code",
                operator: EOperator.EQUAL,
                values: [input.id],
              },
            ] as IAdvanceFilters[],
            order: {
              starts_at: 0,
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact_emails",
              field: "contact_id",
            },
            from: {
              entity: "contacts",
              field: "id",
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact_phone_numbers",
              field: "contact_id",
            },
            from: {
              entity: "contacts",
              field: "id",
            },
          },
        })
        .execute();

      return {
        data: {
          id: items?.[0]?.contacts?.id,
          email: items?.[0]?.contact_emails ? [items?.[0]?.contact_emails] : [],
          phone: items?.[0]?.contact_phone_numbers
            ? [items?.[0]?.contact_phone_numbers]
            : [],
        },
      };
    }),
  getBasicDetails: privateProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.code) return null;

      const record = await ctx.dnaClient
        .findAll({
          entity: "contact",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "code",
                operator: EOperator.EQUAL,
                values: [input.code],
              },
            ],
            pluck: ["id", "first_name", "middle_name", "last_name", "goes_by"],
          },
        })
        .execute();

      const advance_filters = createAdvancedFilter({
        contact_id: record?.data?.[0]?.id,
        status: EStatus.ACTIVE,
        is_primary: true,
      });
      const order = {
        starts_at: 0,
        limit: 1,
        by_field: "created_date",
        by_direction: EOrderDirection.DESC,
      };
      const [contact_emails, contact_phone_numbers] = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity: "contact_email",
            token: ctx.token.value,
            query: {
              advance_filters,
              order,
              pluck: ["email"],
            },
          })
          .execute(),
        ctx.dnaClient
          .findAll({
            entity: "contact_phone_number",
            token: ctx.token.value,
            query: {
              advance_filters,
              order,
              pluck: ["raw_phone_number"],
            },
          })
          .execute(),
      ]);

      const { raw_phone_number = "" } = contact_phone_numbers?.data?.[0] || {};

      const primary_phone_number: string = "+" + raw_phone_number;

      return {
        data: {
          ...record?.data?.[0],
          ...contact_emails?.data?.[0],
          primary_phone_number,
        },
      };
    }),
});

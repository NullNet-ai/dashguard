import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import ZodItems from "~/server/zodSchema/grid/items";
import { EOperator, EOrderDirection, IAdvanceFilters } from "@dna-platform/common-orm";
import { formatSorting } from "~/server/utils/formatSorting";
import { pick } from "lodash";
import { ContactPhoneEmailSchema, EmailSchema } from "~/server/zodSchema/template/contactPhoneEmail";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

const entity = "";

export const templateRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateName: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: rest,
          },
        })
        .execute();

      return res;
    }),
    mainGrid: privateProcedure.input(ZodItems.merge(z.object({
      form_filter_entity: z.string(),
    }))).query(async ({ ctx, input }) => {
      const { form_filter_entity } = input
      const hasAdvanceFilters = input?.advance_filters?.length
        ? [
            // {
            //   type: "operator",
            //   operator: EOperator.AND,
            // },
            ...(input?.advance_filters ?? []),
          ]
        : [...(input?.advance_filters ?? [])];
  
      const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
        .findAll({
          entity: form_filter_entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              [`${form_filter_entity}s`]: ["email", "is_primary"],
              [`${entity}s`]: input.pluck,
            },
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
              entity: form_filter_entity,
              field: `${entity}_id`,
            },
            from: {
              entity,
              field: "id",
            },
          },
        })
        .execute();
  
      //TODO: Transform the data - temporary
      const formatted_items = items.reduce(
        (acc: Record<string, string>[], item) => {
          const { contacts, [`${form_filter_entity}s`] :contact_emails } = item;
          const emails = pick(contact_emails, ["email"]);
          const existing_contact = acc?.find(
            (acc_item: any) => acc_item?.id === contacts?.id,
          );
  
          if (existing_contact) return acc;
  
  
          return [
            ...acc,
            {
              ...contacts,
              ...emails,
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
    fetchContactPhoneEmail: privateProcedure
    .input(
      z.object({
        code: z
          .string({ message: "Contact Code is required." })
          .min(1, { message: "Contact Code is required." }),
        pluck_fields: z.array(z.string()),
        form_filter_entity: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code: contact_code, pluck_fields, form_filter_entity } = input;
      const response = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              [`${form_filter_entity}s`]: ["id", "email", "is_primary"],
              [`${entity}s`]: pluck_fields,
            },
            advance_filters: [
              {
                field: "code",
                operator: EOperator.EQUAL,
                values: [contact_code],
              },
            ] as IAdvanceFilters[],
            order: {
              starts_at: 0,
              limit: 20,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: form_filter_entity,
              field: `${entity}_id`,
            },
            from: {
              entity,
              field: "id",
            },
          },
        })
        .execute();

      const { data: items } = response

      const [contact] = items || [];
      const { [`${form_filter_entity}s`]: contact_emails, [`${entity}s`]: contacts } = contact || {};
      const { id: contact_id = "", code = "", ...rest } = contacts || {} ;

      return {
        id: contact_id,
        code,
        [form_filter_entity]: contact_emails ? [contact_emails] : [],
        ...rest,
      };
    }),
    formFilterGrid: privateProcedure
    .input(ZodItems.merge(z.object({
      form_filter_entity: z.string(),
    })))
    .query(async ({ ctx, input }) => {
      const { pluck, form_filter_entity } = input
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
          entity: form_filter_entity,
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters: [
              {
                type: "criteria",
                field: "id",
                operator: EOperator.NOT_EQUAL,
                values: ["01JCSAG79KQ1WM0F9B47Q700P1"],
              },
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
        .execute();

      // ! JOIN AVAILABLE KINDLY USE and Transform the data ( Map Reduce)
      const totalPages = Math.ceil(totalCount / 100);

      return {
        totalCount, // Total number of users
        items, // Paginated users
        currentPage: 0, // The current page
        totalPages, // Total number of pages
      };
    }),
    saveContactPhoneEmail: privateProcedure
    .input(ContactPhoneEmailSchema.merge(z.object({
      form_filter_entity: z.string(),
    })))
    .mutation(async ({ input, ctx }) => {
      const { id, form_filter_entity } = input;
      const { [form_filter_entity]: email } = input

      const email_pluck = ["email", "id", `${entity}_id`, "is_primary"];
      const email_data = email?.[0];

      let contact_id = id;
      let contact_code = "";

      // Validate phone and email exists
      const fetchRecordData = async (
        entity: string,
        filters: IAdvanceFilters[],
        pluckFields: string[],
      ) => {
        const response = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              advance_filters: filters,
              pluck: pluckFields,
            },
          })
          .execute();

        return response?.data;
      };

      const getContactData = async (
        item: z.infer<typeof EmailSchema>,

        entity: string,
        fieldKey: string,
        pluckFields: string[],
      ) => {
        const field_value = (item as { [key: string]: any })?.[fieldKey];

        if (!field_value) return null;

        const filters = [
          ...createAdvancedFilter({
            [fieldKey]: field_value,
            status: "Active",
          }),
          ...(contact_id
            ? [
                {
                  operator: EOperator.AND,
                  type: "operator",
                },
                {
                  field: `${entity}_id`,
                  operator: EOperator.NOT_EQUAL,
                  type: "criteria",
                  values: [contact_id],
                },
              ]
            : []),
        ];

        return fetchRecordData(entity, filters, pluckFields);
      };

      const [email_exist] = await Promise.all([
        getContactData(
          email_data as z.infer<typeof EmailSchema>,
          `${form_filter_entity}s`,
          "email",
          ["id", "email", "is_primary", `${entity}_id`],
        ),
      ]);

      //AND condition for now.

      if (email_exist?.length) {
        return {
          message: "",
          data: {
            emails: email_exist,
          },

          status_code: 200,
          total_count: 0,
          record_count: 0,
          existing: true,
        };
      }

      // Suppose to create once only
      const insert = async (entity: string, data: any, pluck: string[]) => {
        const record = await ctx.dnaClient
          .create({
            entity: form_filter_entity,
            token: ctx.token.value,
            mutation: {
              params: {
                ...data,
                [`${entity}_id`]: contact_id,
                status: "Active",
                is_primary: true,
              },
              pluck,
            },
          })
          .execute();
        return record?.data?.[0];
      };

      const update = async (entity: string, data: any, pluck: string[]) => {
        const record = await ctx.dnaClient
          .update(data.id, {
            entity: form_filter_entity,
            token: ctx.token.value,
            mutation: {
              params: data,
              pluck,
            },
          })
          .execute();
        return record?.data?.[0];
      };

      const getRecordByContactId = async (
        entity: string,
        contact_id: string,
        record_id: string,
      ) => {
        const advance_filters = createAdvancedFilter({
          [`${entity}_id`]: contact_id,
          id: record_id,
        });
        const record = await ctx.dnaClient
          .findAll({
            entity: form_filter_entity,
            token: ctx.token.value,
            query: {
              advance_filters,
            },
          })
          .execute();
        return record?.data?.[0];
      };

      const [contact_email] = await Promise.all([
        getRecordByContactId(entity, contact_id!, email_data?.id!),
      ]);

      // Since not multiple
      const email_id = contact_email?.id;

      const [email_record] = await Promise.all([
        (email_id || email_data.id)
          ? update(entity, email_data, email_pluck)
          : insert(entity, email_data, email_pluck),
      ]);

      return {
        id: contact_id,
        code: contact_code,
        [form_filter_entity]: [email_record],
      };
    }),
});

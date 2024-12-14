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
import { contactDetailsSchema } from "~/server/zodSchema/contact/contactDetails";
import {
  ContactPhoneEmailSchema,
  EmailSchema,
  PhoneNumberSchema,
} from "../../zodSchema/contact/contactPhoneEmail";
import { EStatus } from "../types";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { getContactsWithPhoneAndEmail } from "../../../utils/phone-email-validation";
import { formatPhoneNumber } from "~/utils/formatter";

const ENTITY = "contact";

export const contactRouter = createTRPCRouter({
  updateContactDetails: privateProcedure
    .input(contactDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;

      return ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: rest,
          },
        })
        .execute();
    }),
  mainGrid: privateProcedure.input(ZodItems).query(async ({ ctx, input }) => {
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
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck_object: {
            contact_emails: ["email", "is_primary"],
            contact_phone_numbers: [
              "raw_phone_number",
              "iso_code",
              "country_code",
              "is_primary",
            ],
            contacts: input.pluck,
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

        const { raw_phone_number, iso_code } = phones;
        const primary_phone_number = formatPhoneNumber({
          raw_phone_number,
          iso_code,
        });

        return [
          ...acc,
          {
            ...contacts,
            ...emails,
            ...phones,
            primary_phone_number,
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
  formFilterGrid: privateProcedure
    .input(ZodItems)
    .query(async ({ ctx, input }) => {
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
            pluck_object: {
              contact_emails: ["email", "is_primary"],
              contact_phone_numbers: [
                "raw_phone_number",
                "iso_code",
                "country_code",
                "is_primary",
              ],
              contacts: input.pluck,
            },
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
  saveContactPhoneEmail: privateProcedure
    .input(ContactPhoneEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, email, phone } = input;

      const email_pluck = ["email", "id", "contact_id", "is_primary"];
      const phone_pluck = [
        "raw_phone_number",
        "id",
        "contact_id",
        "is_primary",
        "iso_code",
        "country_code",
      ];
      const email_data = email?.[0];

      const phone_data = phone?.[0];

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
        item: z.infer<typeof PhoneNumberSchema> | z.infer<typeof EmailSchema>,

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
                  field: "contact_id",
                  operator: EOperator.NOT_EQUAL,
                  type: "criteria",
                  values: [contact_id],
                },
              ]
            : []),
        ];

        return fetchRecordData(entity, filters, pluckFields);
      };

      const [phones_exist, email_exist] = await Promise.all([
        getContactData(
          phone_data as z.infer<typeof PhoneNumberSchema>,
          "contact_phone_numbers",
          "raw_phone_number",
          [
            "id",
            "raw_phone_number",
            "is_primary",
            "contact_id",
            "country_code",
            "iso_code",
          ],
        ),
        getContactData(
          email_data as z.infer<typeof EmailSchema>,
          "contact_emails",
          "email",
          ["id", "email", "is_primary", "contact_id"],
        ),
      ]);

      //AND condition for now.
      const contact_ids = getContactsWithPhoneAndEmail({
        phones_exist: phones_exist || [],
        email_exist: email_exist || [],
      });

      if (contact_ids?.length) {
        return {
          message: "",
          data: {
            phones: phones_exist,
            emails: email_exist,
          },

          status_code: 200,
          total_count: 0,
          record_count: 0,
          existing: true,
        };
      }

      if (!contact_id) {
        const record = await ctx.dnaClient
          .create({
            entity: "contact",
            token: ctx.token.value,
            mutation: {
              params: {
                status: "Draft",
                categories: ["Contact"],
              },
              pluck: ["id", "code"],
            },
          })
          .execute();

        const [contact] = record?.data || [];
        contact_id = contact?.id;
        contact_code = contact?.code;
      }

      // Suppose to create once only
      const insert = async (entity: string, data: any, pluck: string[]) => {
        const record = await ctx.dnaClient
          .create({
            entity,
            token: ctx.token.value,
            mutation: {
              params: {
                ...data,
                contact_id,
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
            entity,
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
          contact_id,
          id: record_id,
        });
        const record = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              advance_filters,
            },
          })
          .execute();
        return record?.data?.[0];
      };

      const [contact_email, contact_phone] = await Promise.all([
        getRecordByContactId("contact_email", contact_id!, email_data?.id!),
        getRecordByContactId(
          "contact_phone_number",
          contact_id!,
          phone_data?.id!,
        ),
      ]);

      // Since not multiple
      const email_id = contact_email?.id;
      const phone_id = contact_phone?.id;

      const [email_record, phone_record] = await Promise.all([
        email_id
          ? update("contact_email", email_data, email_pluck)
          : insert("contact_email", email_data, email_pluck),
        phone_id
          ? update("contact_phone_number", phone_data, phone_pluck)
          : insert("contact_phone_number", phone_data, phone_pluck),
      ]);

      return {
        id: contact_id,
        code: contact_code,
        email: [email_record],
        phone: [phone_record],
      };
    }),
  fetchContactPhoneEmail: privateProcedure
    .input(
      z.object({
        code: z
          .string({ message: "Contact Code is required." })
          .min(1, { message: "Contact Code is required." }),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code: contact_code, pluck_fields } = input;
      const { data: items } = await ctx.dnaClient
        .findAll({
          entity: "contact",
          token: ctx.token.value,
          query: {
            pluck_object: {
              contact_emails: ["id", "email", "is_primary"],
              contact_phone_numbers: [
                "id",
                "raw_phone_number",
                "iso_code",
                "country_code",
                "is_primary",
              ],
              contacts: pluck_fields,
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

      const [contact] = items || [];
      const { contact_emails, contact_phone_numbers, contacts } = contact || {};
      const { id: contact_id = "", code = "", ...rest } = contacts || {};

      return {
        id: contact_id,
        code: code,
        email: contact_emails ? [contact_emails] : [],
        phone: contact_phone_numbers ? [contact_phone_numbers] : [],
        ...rest,
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
              pluck: ["email", "contact_id", "is_primary", "id"],
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
              pluck: [
                "raw_phone_number",
                "id",
                "contact_id",
                "is_primary",
                "iso_code",
                "country_code",
              ],
            },
          })
          .execute(),
      ]);

      return {
        data: {
          ...record?.data?.[0],
          email: contact_emails?.data?.[0],
          phone: contact_phone_numbers?.data?.[0],
        } as Record<string, any>,
      };
    }),
});

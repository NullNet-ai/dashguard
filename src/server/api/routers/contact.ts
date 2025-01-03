import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import ZodItems from "~/server/zodSchema/grid/items";
import {
  EOperator,
  EOrderDirection,
  IAdvanceFilters,
} from "@dna-platform/common-orm";
import { formatSorting } from "~/server/utils/formatSorting";
import { get, pick } from "lodash";
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
      const { id, address_id, details = {}, ...rest } = input;

      let _address_id = address_id || null;

      const getRecord = async (
        entity: string,
        advance_filters: IAdvanceFilters[],
        pluck?: string[],
      ) => {
        const response = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: ["id", ...(pluck || [])],
              advance_filters,
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute();
        const [data] = response.data || [];

        return data ? data : null;
      };

      const getAddressByContactId = async (
        address_id: string | null,
        contact_id: string,
      ) => {
        if (!address_id) {
          // Double check if contact has no address_id
          const advance_filters = createAdvancedFilter({ id: contact_id });
          const response = await getRecord("contact", advance_filters, [
            "address_id",
          ]);
          _address_id = response?.address_id;
          if (_address_id) {
            return { id: _address_id };
          }
          return null;
        }

        const advance_filters = createAdvancedFilter({ address_id });
        const response = await getRecord("address", advance_filters);
        return response;
      };

      const insertAddress = async (
        entity: string,
        data: any,
        pluck: string[],
      ) => {
        const record = await ctx.dnaClient
          .create({
            entity,
            token: ctx.token.value,
            mutation: {
              params: {
                ...data,
                status: "Active",
              },
              pluck,
            },
          })
          .execute();
        const [address] = record?.data || [];
        return address;
      };

      const updateAddress = async (
        entity: string,
        data: any,
        pluck: string[],
      ) => {
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
        const [address] = record?.data || [];
        return address;
      };

      if (Object.values(details).length || _address_id) {
        const address = await getAddressByContactId(_address_id, id);

        if (address?.id) {
          await updateAddress("address", { ...details, id: address?.id }, [
            "id",
            "address",
            "address_line_one",
            "address_line_two",
            "latitude",
            "longitude",
            "place_id",
            "street_number",
            "street",
            "region",
            "region_code",
            "country_code",
          ]);
        } else {
          const address = await insertAddress("address", details, [
            "id",
            "address",
            "address_line_one",
            "address_line_two",
            "latitude",
            "longitude",
            "place_id",
            "street_number",
            "street",
            "region",
            "region_code",
            "country_code",
          ]);
          if (address) _address_id = address?.id;
        }
      }

      return ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: { ...rest, address_id: _address_id },
            pluck: ["id", "address_id"],
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

    const { total_count: totalCount = 1, data: items} = await ctx.dnaClient
      .findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck_group_object: {
            contact_phone_numbers: ["raw_phone_number"]
          },
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
          track_total_records: true,
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
      .join({
        type: 'self',
        field_relation: {
          to: {
            entity: 'contact',
            field: 'created_by',
          },
          from: {
            alias: 'created_by',
            entity: 'contact',
            field: 'id',
          },
        },
      })
      .join({
        type: 'self',
        field_relation: {
          to: {
            entity: 'contact',
            field: 'updated_by',
          },
          from: {
            alias: 'updated_by',
            entity: 'contact',
            field: 'id',
          },
        },
      })
      .execute();

    //TODO: Transform the data - temporary
    const formatted_items = items.reduce(
      (acc: Record<string, string>[], item) => {
        const { contacts, contact_emails, contact_phone_numbers, created_by, updated_by } = item;
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
            created_by: `${created_by?.first_name ?? ''} ${created_by?.last_name ?? ''}`,
            updated_by: `${updated_by?.first_name ?? ''} ${updated_by?.last_name ?? ''}`,
            raw_phone_number: primary_phone_number,
          },
        ];
      },
      [],
    );
    const totalPages = Math.ceil(totalCount / (input.limit || 100));

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
  getContactWithAddress: privateProcedure
    .input(
      z.object({
        code: z.string(),
        pluck_fields: z.array(z.string()),
        address_pluck_fields: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.code) return null;

      const advance_filters = createAdvancedFilter({ code: input.code });

      const record = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck_object: {
              addresses: input.address_pluck_fields || ["address"],
              contacts: input.pluck_fields,
            },
            advance_filters,
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "address",
              field: "id",
            },
            from: {
              entity: ENTITY,
              field: "address_id",
            },
          },
        })
        .execute();

      const [contact] = record?.data || [];
      const { addresses = {}, contacts } = contact || {};
      const data = {
        ...(contacts || {}),
        ...(input?.address_pluck_fields?.length
          ? { address: addresses }
          : addresses),
      };
      return data;
    }),
});

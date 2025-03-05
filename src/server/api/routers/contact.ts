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
import Bluebird from "bluebird";

const ENTITY = "contacts";

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
    const { limit = 50, current = 1,entity, advance_filters = [], pluck, sorting = [], is_case_sensitive_sorting= "false" } = input
    const hasAdvanceFilters = advance_filters?.length
      ? [
          // {
          //   type: "operator",
          //   operator: EOperator.AND,
          // },
          ...(advance_filters ?? []),
        ]
      : [...(advance_filters ?? [])];

    const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
      .findAll({
        entity: entity,
        token: ctx.token.value,
        query: {
          pluck_group_object: {
            contact_phone_numbers: ["raw_phone_number", "is_primary"],
            contact_emails: ["email", "is_primary"],
          },
          pluck_object: {
            contact_emails: ["email", "is_primary"],
            contact_phone_numbers: [
              "raw_phone_number",
              "iso_code",
              "country_code",
              "is_primary",
            ],
            contacts: [...pluck, "previous_status"],
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
              (current || 0) === 0
                ? 0
                : (current || 1) * (limit || 100) -
                  (limit || 100),
            limit: limit || 1,
            // by_field: "created_date",
            // by_direction: EOrderDirection.ASC,
          },
          // @ts-expect-error - multiple_sort is not defined in the type
          multiple_sort: sorting?.length
            ? formatSorting(sorting, ENTITY, is_case_sensitive_sorting)
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
        type: "self",
        field_relation: {
          to: {
            entity: "contact",
            field: "created_by",
          },
          from: {
            alias: "created_by",
            entity: "contact",
            field: "id",
          },
        },
      })
      .join({
        type: "self",
        field_relation: {
          to: {
            entity: "contact",
            field: "updated_by",
          },
          from: {
            alias: "updated_by",
            entity: "contact",
            field: "id",
          },
        },
      })
      .execute();

    const fetchOrganizations = async (contact_id: string) => {
      const org_contacts: any = await ctx.dnaClient
        .findAll({
          entity: "organization_contacts",
          token: ctx.token.value,
          query: {
            pluck_object: {
              organizations: ["id", "name"],
              organization_contacts: [
                "id",
                "contact_organization_id",
                "is_primary",
              ],
            },
            advance_filters: createAdvancedFilter({
              contact_id,
            }),
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "organizations",
              field: "id",
            },
            from: {
              entity: "organization_contacts",
              field: "contact_organization_id",
            },
          },
        })
        .execute();

      const primary_org = org_contacts.data.find(
        (org: Record<string, any>) => !!org.organization_contacts.is_primary,
      );

      const org_contact_user_roles = await ctx.dnaClient
        .findAll({
          entity: "organization_contact_user_roles",
          token: ctx.token.value,
          query: {
            pluck_object: {
              user_roles: ["id", "role"],
              organization_contact_user_roles: ["id"],
            },
            advance_filters: createAdvancedFilter({
              organization_contact_id: primary_org?.organization_contacts?.id,
            }),
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "user_roles",
              field: "id",
            },
            from: {
              entity: "organization_contact_user_roles",
              field: "user_role_id",
            },
          },
        })
        .execute();

      return {
        organization: primary_org?.organizations?.name ?? "",
        roles: org_contact_user_roles?.data
          ? org_contact_user_roles.data.map((item) => item?.user_roles?.role)
          : [],
      };
    };

    let formatted_items = await Bluebird.map(items, async (item: any) => {
      const { organization, roles } = await fetchOrganizations(
        item?.contacts?.id,
      );
      return {
        organization,
        roles,
        ...item,
      };
    });

    //TODO: Transform the data - temporary
    formatted_items = formatted_items.reduce(
      (acc: Record<string, string>[], item: Record<string, any>) => {
        const {
          contacts,
          contact_emails,
          contact_phone_numbers,
          created_by,
          updated_by,
          roles,
          organization,
        } = item;

        const emails = pick(contact_emails, ["emails", "is_primaries"]);
        const phones = pick(contact_phone_numbers, [
          "raw_phone_numbers",
          "iso_code",
          "country_code",
          "is_primaries",
        ]);
        const existing_contact = acc?.find(
          (acc_item: any) => acc_item?.id === contacts?.id,
        );

        if (existing_contact) return acc;

        const {
          raw_phone_numbers,
          iso_code,
          is_primaries: p_is_primaries,
        } = phones;
        const { emails: _emails, is_primaries: e_is_primaries } = emails;
        const filterPrimary = (li: string[], is_primaries: number[]) => {
          if (!li || !is_primaries) return null;
          const index = is_primaries?.findIndex(
            (is_primary) => is_primary === 1,
          );
          return index !== -1 ? li[index] : null;
        };
        const _primary_phone_number = filterPrimary(
          raw_phone_numbers,
          p_is_primaries,
        );
        const primary_email = filterPrimary(_emails, e_is_primaries);

        const primary_phone_number = formatPhoneNumber({
          raw_phone_number: _primary_phone_number as string,
          iso_code,
        });

        return [
          ...acc,
          {
            roles,
            organization,
            ...contacts,
            ...emails,
            ...phones,
            created_by: `${created_by?.first_name ?? ""} ${created_by?.last_name ?? ""}`,
            updated_by: `${updated_by?.first_name ?? ""} ${updated_by?.last_name ?? ""}`,
            raw_phone_number: primary_phone_number,
            email: primary_email,
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
      const {is_case_sensitive_sorting = "false"} = input
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
            // @ts-expect-error - multiple_sort is not defined in the type
            multiple_sort: input.sorting?.length
              ? formatSorting(input.sorting, input?.entity, is_case_sensitive_sorting)
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
      const { id, emails, phones } = input;

      const email_pluck = ["email", "id", "contact_id", "is_primary"];
      const phone_pluck = [
        "raw_phone_number",
        "id",
        "contact_id",
        "is_primary",
        "iso_code",
        "country_code",
      ];
      const email_data = emails?.find((email) => email.is_primary);

      const phone_data = phones?.find((phone) => phone.is_primary);

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

      if (!contact_id)
        return {
          status_code: 500,
          message: "Contact ID is required.",
        };

      const email_records = await Promise.all(
        emails.map(async (email) => {
          const existing_email = await getRecordByContactId(
            "contact_email",
            contact_id!,
            email.id!,
          );
          if (existing_email) {
            return update("contact_email", email, email_pluck);
          } else {
            return insert("contact_email", email, email_pluck);
          }
        }),
      );

      const phone_records = await Promise.all(
        phones.map(async (phone) => {
          const existing_phone = await getRecordByContactId(
            "contact_phone_number",
            contact_id!,
            phone.id!,
          );
          return existing_phone
            ? update("contact_phone_number", phone, phone_pluck)
            : insert("contact_phone_number", phone, phone_pluck);
        }),
      );

      return {
        id: contact_id,
        code: contact_code,
        emails: email_records,
        phones: phone_records,
      };
    }),
  fetchContactPhoneEmail: privateProcedure
    .input(
      z.object({
        code: z
          .string({ message: "Contact Code is required." })
          .min(1, { message: "Contact Code is required." }),
        pluck_fields: z.array(z.string()),
        is_multiple: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code: contact_code, pluck_fields, is_multiple } = input;
      const { data: items } = await ctx.dnaClient
        .findAll({
          entity: "contact",
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
            advance_filters: [
              {
                field: "code",
                operator: EOperator.EQUAL,
                values: [contact_code],
              },
            ] as IAdvanceFilters[],
          },
        })
        .execute();

      const getRecordByContactId = async (
        entity: string,
        contact_id: string,
        pluck_fields: string[],
      ) => {
        const advance_filters = createAdvancedFilter({
          contact_id,
          ...(is_multiple ? {} : { is_primary: true }),
        });
        const record = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              advance_filters,
              pluck: pluck_fields,
            },
          })
          .execute();
        return record?.data;
      };

      const [contact] = items || [];
      const {
        id: contact_id = "",
        code = "",
        address_id,
        ...rest
      } = contact || {};

      const phones = await getRecordByContactId(
        "contact_phone_number",
        contact_id!,
        ["id", "raw_phone_number", "iso_code", "country_code", "is_primary"],
      );

      const emails = await getRecordByContactId("contact_email", contact_id!, [
        "id",
        "email",
        "is_primary",
      ]);

      return {
        ...rest,
        id: contact_id,
        code: code,
        emails,
        phones,
        address_id: address_id,
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

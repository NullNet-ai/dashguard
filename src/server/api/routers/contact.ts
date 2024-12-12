import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  BasicDetailsForm,
  ProfessionalDetailsForm,
} from "../../zodSchema/contacts/basicDetails";
import { ContactCategoryDetailsSchema } from "~/server/zodSchema/contacts/categoryDetails";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { nationalities } from "~/server/utils/nationalities";
import { contactPersonalDetailsZod } from "~/server/zodSchema/contacts/contactPersonalDetailsZod";
import { countriesAndCities } from "~/server/utils/addresses";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import ZodItems from "~/server/zodSchema/grid/items";
import { pick } from "lodash";
import { ContactRoleDetailsSchema } from "~/server/zodSchema/contacts/roleDetails";
import { EStatus } from "../types";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contacts/contactPhoneEmail";
import { ContactStatusSchema } from "~/server/zodSchema/contacts/contactStatus";
import { formatSorting } from "~/server/utils/formatSorting";
// import Bluebird from "bluebird";
// import { faker } from "@faker-js/faker";
const getNonEmptyFields = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => !!value),
  );
};

const ENTITY = "contact";

export const contactRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateBasicDetails: privateProcedure
    .input(
      BasicDetailsForm.extend({
        id: z.string(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { first_name, last_name, middle_name, goes_by } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              first_name,
              last_name,
              middle_name,
              goes_by,
            },
          },
        })
        .execute();
    }),
  updateProfessionalDetails: privateProcedure
    .input(
      ProfessionalDetailsForm.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        current_company,
        current_title,
        salary_currency,
        current_salary,
        notice_period,
        years_of_experience,
      } = input;

      return ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              current_title,
              current_company,
              salary_currency,
              current_salary: Number(current_salary),
              notice_period,
              years_of_experience: Number(years_of_experience),
            },
          },
        })
        .execute();
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
  updateRoleDetails: privateProcedure
    .input(
      ContactRoleDetailsSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user_role_id } = input;
      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              user_role_id: user_role_id,
            },
          },
        })
        .execute();
    }),
  getUserRole: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: "user_roles",
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
  getUserRoleOptions: privateProcedure.query(async ({ ctx }) => {
    const filter = async ({
      entity,
      pluck,
      advance_filters,
      limit,
    }: {
      entity: string;
      pluck: string[];
      advance_filters: IAdvanceFilters<string | number>[];
      limit?: number;
    }) => {
      return await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters,
            order: {
              limit: limit || 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();
    };
    const orgs = await filter({
      entity: "user_roles",
      pluck: ["id", "role"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return orgs.data?.map((item) => {
      const { id, role } = item;
      return {
        value: id,
        label: role,
      };
    });
  }),
  // createOrganizationContact: privateProcedure
  //   .input(
  //     z.object({
  //       organization_id: z.string(),
  //       id: z.string().min(1),
  //     }),
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     ctx.dnaClient
  //       .create({
  //         entity: "organization_contacts",
  //         token: ctx.token.value,
  //         mutation: {
  //           params: {
  //             organization_id: input.organization_id,
  //             contact_id: input.id,
  //           },
  //         },
  //       })
  //       .execute();
  //   }),

  getAllOrganization: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findAll({
          entity: "organizations",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "status",
                operator: EOperator.EQUAL,
                values: ["Active"],
              },
            ],
            pluck: input.pluck_fields,
          },
        })
        .execute();
      return {
        ...record,
        data: record?.data,
      };
    }),

  // getOrgByContactId: privateProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       pluck_fields: z.array(z.string()),
  //     }),
  //   )
  //   .query(async ({ input, ctx }) => {
  //     if (!input?.id) return null;
  //     const default_organization_id = ctx.session.account.organization_id;
  //     const record = await ctx.dnaClient
  //       .findAll({
  //         entity: "organization_contacts",
  //         token: ctx.token.value,
  //         query: {
  //           advance_filters: [
  //             {
  //               type: "criteria",
  //               field: "contact_id",
  //               operator: EOperator.EQUAL,
  //               values: [input.id],
  //             },
  //           ],
  //           order: {
  //             starts_at: 0,
  //             limit: 100,
  //             by_field: "created_date",
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           pluck: input.pluck_fields,
  //         },
  //       })
  //       .execute();

  //     const organization_ids = record.data.map(
  //       (org_contact) => org_contact.organization_id,
  //     );

  //     const final_record = await ctx.dnaClient
  //       .findAll({
  //         entity: "organizations",
  //         token: ctx.token.value,
  //         query: {
  //           advance_filters: [
  //             {
  //               type: "criteria",
  //               field: "id",
  //               operator: EOperator.EQUAL,
  //               values: [...organization_ids, default_organization_id],
  //             },
  //           ],
  //           order: {
  //             limit: 5,
  //             by_field: "created_date",
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           pluck: ["name", "id"],
  //         },
  //       })
  //       .execute();

  //     return {
  //       ...final_record,
  //       data: final_record?.data,
  //     };
  //   }),

  updateContactWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              tags,
            },
          },
        })
        .execute();
    }),
  nationalities: privateProcedure.query(async () => {
    return nationalities.map((nationality) => ({
      value: nationality,
      label: nationality,
    }));
  }),
  countries: privateProcedure.query(async () => {
    return Object.keys(countriesAndCities).map((country) => ({
      value: country,
      label: country,
    }));
  }),
  cities: privateProcedure
    .input(
      z.object({
        country: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return (countriesAndCities[input.country] || []).map((city: string) => ({
        value: city,
        label: city,
      }));
    }),
  updatepersonaldetails: privateProcedure
    .input(
      contactPersonalDetailsZod.refine((data) => {
        if (!data?.id) return false;
        return true;
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        address = null,
        nationalities = [],
        ...rest_data
      } = input || {};

      let address_id;
      let _nationalities: any = nationalities;

      if (address) {
        const none_empty_address = getNonEmptyFields(address);
        // how about the null ones? should include in the filters.
        const advance_filters = createAdvancedFilter(none_empty_address);
        const get_address = await ctx.dnaClient
          .findAll({
            entity: "addresses",
            token: ctx.token.value,
            query: {
              pluck: ["id"],
              advance_filters,
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute();

        if (!get_address?.data?.length) {
          const create_address = await ctx.dnaClient
            .create({
              entity: "addresses",
              token: ctx.token.value,
              mutation: {
                pluck: ["id"],
                params: none_empty_address,
              },
            })
            .execute();
          address_id = create_address?.data?.[0]?.id;
        } else {
          address_id = get_address?.data?.[0]?.id;
        }
      }

      if (nationalities.length) {
        _nationalities = _nationalities.map(
          (national: { value: string }) => national.value,
        );
      }

      return ctx.dnaClient
        .update(id!, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              ...rest_data,
              ...(address_id
                ? {
                    address_id,
                  }
                : {}),
              nationalities: _nationalities,
            },
          },
        })
        .execute();
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
  getContactByOrganizationId: privateProcedure
    .input(z.object({ organization_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organization_id } = input;

      const filterContactOrgs = async (entity: string, field: string) => {
        const advance_filters = createAdvancedFilter({
          [field]: organization_id,
          status: EStatus.ACTIVE,
        });

        const org_contacts = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              advance_filters,
              order: {
                starts_at: 0,
                limit: 100,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
              pluck: ["contact_id"],
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: entity,
                field: "id",
              },
              from: {
                entity,
                field: "contact_id",
              },
            },
          })
          .execute();
        return org_contacts?.data;
      };

      const contact_orgs = await filterContactOrgs(
        "contact_organizations",
        "contact_organization_id",
      );

      const contact_sub_orgs = await filterContactOrgs(
        "contact_sub_organizations",
        "sub_organization_id",
      );

      const contacts = [...contact_orgs, ...contact_sub_orgs].map(
        ({ contacts }) => ({
          value: contacts.id,
          label: `${contacts.first_name} ${contacts.last_name}`,
        }),
      );

      return contacts;
    }),
  // generateTestContact: privateProcedure.mutation(async ({ ctx }) => {
  //   setInterval(async () => {
  //     ctx.dnaClient
  //       .create({
  //         entity: entity,
  //         token: ctx.token.value,
  //         mutation: {
  //           params: {
  //             first_name: faker.person.firstName(),
  //             last_name: faker.person.lastName(),
  //             goes_by: "Test",
  //             categories: ["Contact"],
  //             status: EStatus.ACTIVE,
  //           },
  //         },
  //       })
  //       .execute();
  //   }, 500);

  //   return [];
  // }),
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
  updateContactStatus: privateProcedure
    .input(
      ContactStatusSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { contact_status } = input;
      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              contact_status: contact_status,
            },
          },
        })
        .execute();
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

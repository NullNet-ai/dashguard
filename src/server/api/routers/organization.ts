import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
const ENTITY = "organization";

export const organizationRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const { pluck_fields } = input;
      const org_id = ctx.session?.account?.organization.id;

      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
          },
        })
        .execute();

      const data = record?.data?.[0];
      const p_org =
        pluck_fields.includes("parent_organization_id") &&
        !data?.parent_organization_id;

      return {
        ...record,
        data: {
          ...data,
          ...(p_org && {
            parent_organization_id: org_id,
          }),
        } as Record<string, any>,
      };
    }),
  getCurrentLoginOrg: privateProcedure
    .input(
      z.object({
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck_fields } = input;
      const org_id = ctx.session?.account?.organization.id;

      const record = await ctx.dnaClient
        .findOne(org_id, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
          },
        })
        .execute();

      const [current_org] = record?.data || [];

      return current_org;
    }),
  update: privateProcedure
    .input(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1).optional(),
          parent_organization_id: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
        .refine((data) => {
          if (data.name && !data.parent_organization_id) {
            return false;
          }
          return true;
        }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.name) {
        const advance_filters = createAdvancedFilter({
          name: input.name,
          parent_organization_id: input.parent_organization_id!,
        });

        const org = await ctx.dnaClient
          .findAll({
            entity: ENTITY,
            token: ctx.token.value,
            query: {
              pluck: ["id", "status"],
              advance_filters,
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute();

        if (org.data.length > 0 && org?.data[0]?.id !== input.id) {
          const { id: existing_id, status } = org?.data[0] || {};
          return {
            message: "Organization already exists",
            data: [],
            status_code: 409,
            total_count: 0,
            record_count: 0,
            existing: true,
            existing_record: {
              id: existing_id,
              status,
            },
            errors: {
              form: [
                {
                  field: "name",
                  message: "Name already exists.",
                },
              ],
            },
          };
        }
      }
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "organization",
          token: ctx.token.value,
          mutation: {
            params: {
              name: input.name,
              parent_organization_id:
                input?.parent_organization_id ??
                ctx.session.account.organization_id,
              organization_id: ctx.session.account.organization_id,
              tags: input.tags,
            },
          },
        })
        .execute();

      return res;
    }),
  parentOrganizations: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const user_id = ctx.session?.account?.contact?.id;
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
        entity: ENTITY,
        pluck: ["id", "name"],
        advance_filters: [
          {
            type: "criteria",
            field: "status",
            operator: EOperator.EQUAL,
            values: ["Active"],
          },
          {
            type: "operator",
            operator: EOperator.AND,
          },
          {
            type: "criteria",
            field: "id",
            operator: EOperator.NOT_EQUAL,
            values: [input.id],
          },
        ],
      });
      return orgs.data?.map((item) => {
        const { id, name } = item;
        return {
          value: id,
          label: name,
        };
      });
    }),
  deleteById: privateProcedure
    ?.input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Archive",
            },
          },
        })
        .execute();
    }),
  updateAssign: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        parent_organization_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              parent_organization_id:
                input?.parent_organization_id ??
                ctx.session.account.organization_id,
              organization_id: ctx.session.account.organization_id,
            },
          },
        })
        .execute();
    }),
  selectedRecord: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.dnaClient
        .findOne(input?.id, {
          entity: ENTITY,
          query: {
            pluck: input?.pluck,
          },
          token: ctx.token.value,
        })
        .execute();

      const { data: parentOrg } = await ctx.dnaClient
        .findOne(data?.[0]?.parent_organization_id, {
          entity: ENTITY,
          query: {
            pluck: input?.pluck,
          },
          token: ctx.token.value,
        })
        .execute();

      const response = data?.map((item) => {
        return {
          ...item,
          parent_organization: parentOrg?.[0],
        };
      });

      return response;
    }),
  archiveOrganization: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Archive",
            },
          },
        })
        .execute();
    }),
  getOrganizationByParentIds: privateProcedure
    .input(z.object({ parent_organization_ids: z.array(z.string()).min(1) }))
    .query(async ({ input, ctx }) => {
      const { parent_organization_ids } = input;
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
        const { data } = await ctx.dnaClient
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

        return data;
      };

      const filter_data = await filter({
        entity: "organizations",
        pluck: ["id", "name", "organization_id", "contact_id"],
        advance_filters: [
          {
            type: "criteria",
            field: "status",
            operator: EOperator.EQUAL,
            values: ["Active"],
          },
          {
            type: "operator",
            operator: EOperator.AND,
          },
          {
            type: "criteria",
            field: "parent_organization_id",
            operator: EOperator.EQUAL,
            values: parent_organization_ids,
          },
        ],
      });

      return filter_data;
    }),
  getCurrentUserSubOrganizations: privateProcedure.query(async ({ ctx }) => {
    const current_org = ctx.session?.account?.organization_id;

    const advance_filters = createAdvancedFilter({
      parent_organization_id: current_org,
      status: "Active",
    });
    const { data } = await ctx.dnaClient
      .findAll({
        entity: "organizations",
        token: ctx.token.value,
        query: {
          pluck: ["id", "name"],
          advance_filters,
          order: {
            limit: 100,
            by_field: "created_date",
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute();

    return data;
  }),
  updateOrganizationsWithTags: privateProcedure
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

  getOrgSummary: privateProcedure
    .input(
      z.object({
        code: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.code) return null;

      const record = await ctx.dnaClient
        .findByCode(input.code, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      const advance_filters = createAdvancedFilter({
        id: record?.data?.[0]?.parent_organization_id,
      });
      const { data } = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
            advance_filters,
          },
        })
        .execute();

      return {
        ...record,
        data: { ...record?.data?.[0], parent_organization: data?.[0]?.name },
      };
    }),
  getOrgWithContact: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const advance_filters = createAdvancedFilter({
        contact_organization_id: input.id,
      });
      const record = await ctx.dnaClient
        .findAll({
          entity: "organization_contact",
          token: ctx.token.value,
          query: {
            advance_filters,
            pluck: input.pluck_fields,
            pluck_object: {
              organization_contacts: ["id", "contact_organization_id"],
              contacts: ["organization_id", "status"],
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
              entity: "organization_contact",
              field: "contact_id",
            },
          },
        })
        .execute();

      if (record.data?.[0]?.contacts?.status === 'Active') {
        return record.data[0].organization_contacts;
      }
      return null;

    }),
});

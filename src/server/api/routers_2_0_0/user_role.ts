import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import RoleCategoryDetailsSchema from '~/server/zodSchema/user_role/categoryDetails';

import { UserRoleFormSchema } from '../../zodSchema/user_role/basicDetails';
import { createDefineRoutes } from '../baseCrud';

export const userRolesRouter = createTRPCRouter({
  ...createDefineRoutes('user_roles'),
  saveUserRole: privateProcedure
    .input(UserRoleFormSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { role, id: user_role_id } = input;

      const roles = await ctx.dnaClient
        .findAll({
          entity: 'user_roles',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'status'],
            advance_filters: [
              ...createAdvancedFilter({ role }),
              ...(user_role_id
                ? [
                    {
                      operator: EOperator.AND,
                      type: 'operator',
                    },
                    {
                      field: 'id',
                      operator: EOperator.NOT_EQUAL,
                      type: 'criteria',
                      values: [user_role_id],
                    },
                  ]
                : []),
            ],
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (roles?.data?.length) {
        const [role] = roles.data;
        const { id: existing_id, status } = role || {};
        return {
          message: 'Role already exists.',
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
                field: 'role',
                message: 'Role already exists.',
              },
            ],
          },
        };
      }

      if (!user_role_id) {
        const record = await ctx.dnaClient
          .create({
            entity: 'user_role',
            token: ctx.token.value,
            mutation: {
              params: {
                status: 'Draft',
                role,
              },
              pluck: ['id', 'code', 'role'],
            },
          })
          .execute();

        return record;
      }

      const res = await ctx.dnaClient
        .update(user_role_id!, {
          entity: 'user_role',
          token: ctx.token.value,
          mutation: {
            params: {
              role,
            },
            pluck: ['id', 'code', 'role'],
          },
        })
        .execute();

      return res;
    }),
  saveCategoryDetails: privateProcedure
    .input(RoleCategoryDetailsSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, categories, entity } = input;

      const updated_category_details_response = await ctx.dnaClient
        .update(id, {
          entity: 'user_roles',
          token: ctx.token.value,
          mutation: {
            params: {
              categories: [categories],
              entity,
            },
          },
        })
        .execute();

      return updated_category_details_response;
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const role = await ctx.dnaClient
        .findAll({
          entity: 'user_roles',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'status'],
            advance_filters: createAdvancedFilter({ role: input.role }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (role.data.length > 0 && role?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = role?.data[0] || {};
        return {
          message: 'Role already exists',
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
                field: 'role',
                message: 'Role already exists.',
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: 'user_roles',
          token: ctx.token.value,
          mutation: {
            params: {
              role: input.role,
            },
          },
        })
        .execute();

      return res;
    }),
});

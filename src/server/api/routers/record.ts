import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { EOperator, type IAdvanceFilters } from '@dna-platform/common-orm';
import { TRPCError } from '@trpc/server';
import Entities from '~/auto-generated/entities';
import { headers } from 'next/headers';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { addCommonGridJoins, addCommonGridPluckObject } from '~/server/utils/queryBuilder';
import pluralize from 'pluralize';
import { setMetaHeader } from '~/utils/request-header';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

export const recordRouter = createTRPCRouter({
  getById: privateProcedure
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

  getByCode: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      try {
        const recordByCode = await ctx.dnaClient
          .findByCode(input.id, {
            entity: input.main_entity,
            token: ctx.token.value,
            query: {
              pluck: input.pluck_fields,
            },
          })
          .execute();
        const { data, ...rest } = recordByCode ?? {};
        return {
          ...rest,
          data: data?.[0],
        };
      } catch (error) {
        return {
          data: undefined,
          status_code: 404,
          message: 'Record not found',
          success: false,
          error,
        } as Record<string, any>;
      }
    }),
    getByCodeWithJoin: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, pluck_fields, main_entity: entity } = input;

      const base_query = {
        entity,
        token: ctx.token.value,
        query: {
          advance_filters: [
            {
              type: 'criteria',
              field: 'code',
              operator: 'equal',
              values: [id],
            },
          ] as IAdvanceFilters<string | number>[],
          pluck_object: {
            ...addCommonGridPluckObject(),
            [`${pluralize(entity)}`]: pluck_fields,
          },
        },
      };
   
      const query = ctx.dnaClient.findAll(base_query);
      addCommonGridJoins(query, entity);

      const response = await query.execute();

      const { data } = response;

      let {
        created_by,
        updated_by,
        [pluralize(entity)]: entity_data,
      } = data?.[0] ?? {};

      if (!entity_data)
        entity_data = data?.[0];

      if (Array.isArray(created_by))
        created_by = created_by[0];
      
      if (Array.isArray(updated_by))
        updated_by = updated_by[0];
      
      const formatted_data = {
        ...response,
        data: {
          ...entity_data,
          created_by_data: created_by,
          updated_by_data: updated_by,
        },
      };
      return formatted_data;
    }),
  getSessionInfo: privateProcedure.query(async ({ ctx }) => {
    const asRoot = true;
    const response = ctx.session.account;

    const rootAccount = await ctx.dnaClient
      .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
      .execute();
    const rootAccountToken = rootAccount?.data?.[0]?.token;
    const accounts = await ctx.dnaClient
      .findAll({
        entity: 'account_organizations',
        token: rootAccountToken,
        as_root: asRoot,
        query: {
          advance_filters: createAdvancedFilter({
            email: response?.account_id,
            // status: 'Active',
            // account_organization_status: 'Active',
          }),
          pluck_object: {
            account_organizations: [
              'id',
              'organization_id',
              'account_id',
              'contact_id',
              'status',
            ],
            contacts: ['id', 'first_name', 'last_name'],
            organizations: ['name', 'id'],
            user_roles: ['role', 'id'],
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'contacts',
            field: 'id',
          },
          from: {
            entity: 'account_organizations',
            field: 'contact_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'organizations',
            field: 'id',
          },
          from: {
            entity: 'account_organizations',
            field: 'organization_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'user_roles',
            field: 'id',
          },
          from: {
            entity: 'account_organizations',
            field: 'role_id',
          },
        },
      })
      .execute();
    const accountProfile = {
      account_name: `${response?.profile?.first_name || ''} ${response?.profile?.last_name || ''}`,
      username: response?.profile?.email,
    }

    const accountOrganizations = accounts.data?.reduce(
      (orgs: any, account: any) => {
        let {
          account_organizations,
          contacts,
          organizations,
          user_roles,
          external_contacts,
        } = account ?? {};

        if (Array.isArray(contacts)) {
          contacts = contacts[0];
        }

        if (Array.isArray(organizations)) {
          organizations = organizations[0];
        }

        if (Array.isArray(user_roles)) {
          user_roles = user_roles[0];
        }
        
        const firstname = `${contacts?.first_name || external_contacts?.first_name}`;
        const lastname = `${contacts?.last_name || external_contacts?.last_name}`;
        if (organizations?.id === response?.organization_id) {
          return {
            ...orgs,
            current_organization: {
              ...accountProfile,
              organization: organizations?.name || '',
              role: user_roles?.role,
              organization_id: organizations?.id,
            },
          };
        }

        return {
          ...orgs,
          other_organizations: [
            ...orgs.other_organizations,
            {
              account_name: `${firstname || ''} ${lastname || ''}`,
              username: account_organizations?.account_id || '',
              organization: organizations?.name || '',
              role: user_roles?.role,
              organization_id: organizations?.id,
            },
          ],
        };
      },
      {
        current_organization: {},
        other_organizations: [],
      },
    );

    return accountOrganizations;
  }),
  archiveRecord: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        entity: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await setMetaHeader(ctx, input.entity);
      return ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: 'Archived',
            },
          },
        })
        .execute();
    }),
  updateRecordState: privateProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        entity: z.string().refine(
          (value) => {
            return Entities.includes(value);
          },
          {
            message:
              'Invalid entity name. It must be one of the DnaOrm models.',
          },
        ),
        status: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await setMetaHeader(ctx, input.entity);
      const record = await ctx.dnaClient
        .findByCode(input.identifier, {
          entity: input.entity,
          token: ctx.token.value,
          query: {
            pluck: ['id'],
          },
        })
        .execute();
      const record_id = record?.data?.[0]?.id;
      if (!record_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      }

      await ctx.dnaClient
        .update(record_id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: input.status,
            },
            pluck: ['id', 'code'],
          },
        })
        .execute();
    }),
  updateDynamicRecord: privateProcedure
    .input(
      z.object({
        entity: z.string().min(1),
        id: z.string().min(1),
        data: z.any(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await setMetaHeader(ctx, input.entity);
      const result = await ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: input.data,
          },
        })
        .execute();
  
      return result;
    }),
  updateRecordStatus: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        entity: z.string(),
        record_status: z.string().min(1),
        field_key: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await setMetaHeader(ctx, input.entity);
      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , , , identifier] = pathName.split('/');
      const { id, entity, record_status, field_key } = input ?? {};
     
      const record = await ctx.dnaClient
        .findByCode(identifier || id, {
          entity,
          token: ctx.token.value,
          query: {
            pluck: ['id'],
          },
        })
        .execute();
      const record_id = record?.data?.[0]?.id;
      if (!record_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      }

      await ctx.dnaClient
        .update(record_id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              [field_key]: record_status,
            },
            pluck: ['id', 'code', field_key],
          },
        })
        .execute();
    }),
  getOptionsByCurrentState: privateProcedure
    .input(
      z.object({
        code: z.string(),
        status: z.string(),
        categories: z.array(z.string()),
        email: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {

      const account = ctx.session.account;
      const accountEmail = account?.account_id;

      const menuOptions = {
        Active: [
          ...(input.categories.includes('External User')
            ? [
                {
                  label: 'Disable Access',
                  status: 'Access Disabled',
                  disabled: accountEmail?.toLowerCase() === input.email?.toLowerCase(),
                },
              ]
            : [
                {
                  label: 'Deactivate Account',
                  status: 'Deactivated',
                  disabled: accountEmail?.toLowerCase() === input.email?.toLowerCase(),
                },
              ]),
        ],
        'Access Disabled': [
          {
            label: 'Enable Access',
            status: 'Active',
          },
        ],
        Deactivated: [
          {
            label: 'Activate Account',
            status: 'Active',
          },
        ],
        Invited: [
          {
            label: 'Cancel Invitation',
            status: 'Invitation Canceled',
          },
        ],
      };

      const options =
        menuOptions[input.status as keyof typeof menuOptions] ?? [];

      return options.length
        ? [
            {
              label: 'Change Status',
              children: options,
            },
          ]
        : [];
    }),
});

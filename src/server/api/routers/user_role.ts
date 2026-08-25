import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createCallerFactory, createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import ZodItems from '~/server/zodSchema/grid/items';
import RoleCategoryDetailsSchema from '~/server/zodSchema/user_role/categoryDetails';
import { get_meta_header } from '~/utils/request-header';

import { UserRoleFormSchema } from '../../zodSchema/user_role/basicDetails';
import { createDefineRoutes } from '../baseCrud';
import { contactRouter } from './contact';

// WP-832 — "users holding this role".
//
// There is NO join table between contact and user_role: the link is the
// single-valued field `account_organizations.role_id`. Resolution is therefore
// deliberately ADDITIVE and done in TWO separate queries rather than one join.
// The Store answers a rejected entity/join with HTTP 200 + an EMPTY ARRAY for
// the WHOLE query, so a rejected join would silently show an empty grid that
// looks like "this role has no users". Both halves below were probed against
// the live Store (2026-08-25) with nonsense-entity controls returning 0.
const contactCaller = createCallerFactory(contactRouter);

// Mirrors contact/grid/page.tsx's _pluck so the tab's rows are the same shape
// the Users menu grid renders.
const CONTACT_GRID_PLUCK = [
  'id',
  'code',
  'categories',
  'organization_id',
  'first_name',
  'middle_name',
  'last_name',
  'status',
  'created_date',
  'updated_date',
  'created_time',
  'updated_time',
  'created_by',
  'updated_by',
];

// The ORM has no IN operator — an OR chain is the idiom
// (see src/server/utils/deviceOnlineStatus.ts buildDeviceIdFilter).
const buildOrChain = (values: string[], field: string, entity: string) =>
  values.flatMap((value, index) => [
    ...(index === 0
      ? []
      : [{ type: 'operator' as const, operator: EOperator.OR }]),
    {
      type: 'criteria' as const,
      field,
      operator: EOperator.EQUAL,
      values: [value],
      entity,
    },
  ]);

// The Store returns account_organizations rows either flat or wrapped in a
// single-element `account_organizations` array depending on the query shape, so
// every field read here goes through this accessor.
const readRowField = (row: Record<string, any>, field: string) =>
  row?.[field] ?? row?.account_organizations?.[0]?.[field];

// WP-832 review blocker — CROSS-ORG OVERREACH.
//
// `account_organizations` rows are PER ORGANIZATION: one contact who belongs to
// several organizations has one row (and one `role_id`) in each. Filtering only
// on contact_id/role_id therefore reads — and, in assignUsers, REWRITES — that
// person's role in EVERY organization they belong to. Every query and mutation
// below is scoped to the caller's current organization.
//
// `ctx.session.account.organization_id` is the existing idiom for "the caller's
// current organization"; the same field is used as the multi-tenant guard in
// src/server/api/routers/auth.ts:667 and :736
// (`record.organization_id !== ctx.session.account.organization_id`).
const currentOrganizationId = (ctx: any): string => {
  const organization_id = ctx?.session?.account?.organization_id;

  if (!organization_id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No current organization on the session.',
    });
  }

  return organization_id;
};

// Scoping is applied in JS rather than as an extra `advance_filters` criteria on
// purpose: the contact_id/role_id predicate is already an OR chain and the ORM
// filter list is flat (no parentheses), so AND-ing an org criteria onto it would
// depend on undocumented operator precedence. A rejected filter here would fail
// OPEN (the Store answers with all rows), which on a permissions path is the one
// failure mode that must not happen.
const scopeToOrganization = (
  rows: Record<string, any>[],
  organization_id: string,
) => rows.filter((row) => readRowField(row, 'organization_id') === organization_id);

/** account_organizations rows whose role_id matches (or deliberately does not match) a role, in the caller's org only. */
const fetchAccountOrganizations = async (
  // Typed loosely for the same reason every other router helper here is: the
  // ORM client's generic Model<any> does not satisfy a hand-written interface.
  ctx: any,
  user_role_id: string,
  operator: EOperator,
) => {
  const organization_id = currentOrganizationId(ctx);

  const response = await ctx.dnaClient
    .findAll({
      entity: 'account_organizations',
      token: ctx.token.value,
      query: {
        pluck: ['id', 'contact_id', 'role_id', 'organization_id'],
        order: { limit: 1000 },
        advance_filters: [
          {
            type: 'criteria',
            field: 'role_id',
            operator,
            values: [user_role_id],
            entity: 'account_organizations',
          },
        ],
      },
    })
    .execute();

  return scopeToOrganization(
    (response?.data ?? []) as Record<string, any>[],
    organization_id,
  );
};

const pluckContactIds = (rows: Record<string, any>[]) => [
  ...new Set(
    rows.map((row) => readRowField(row, 'contact_id')).filter(Boolean) as string[],
  ),
];

const EMPTY_GRID = (current?: number) => ({
  totalCount: 0,
  items: [] as Record<string, any>[],
  currentPage: current ?? 1,
  totalPages: 0,
});

export const userRolesRouter = createTRPCRouter({
  ...createDefineRoutes('user_roles'),

  // Query 1: role -> contact_ids. Query 2: contact_ids -> the very same
  // contact.mainGrid resolver the Users menu grid uses, so the rows (and the
  // `roles` cell the e2e asserts on) are identical to that grid's.
  members: privateProcedure
    .input(ZodItems.extend({ user_role_id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const contact_ids = pluckContactIds(
        await fetchAccountOrganizations(ctx, input.user_role_id, EOperator.EQUAL),
      );

      if (!contact_ids.length) return EMPTY_GRID(input.current);

      return contactCaller(ctx as any).mainGrid({
        ...input,
        entity: 'contact',
        pluck: CONTACT_GRID_PLUCK,
        advance_filters: buildOrChain(contact_ids, 'id', 'contacts'),
        grouping: [],
      });
    }),

  // Contacts that already have an account_organizations row pointing at some
  // OTHER role. Contacts with no account row are excluded on purpose: creating
  // one needs email + account_id, which is account provisioning, not this ticket.
  assignableUsers: privateProcedure
    .input(ZodItems.extend({ user_role_id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const contact_ids = pluckContactIds(
        await fetchAccountOrganizations(
          ctx,
          input.user_role_id,
          EOperator.NOT_EQUAL,
        ),
      );

      if (!contact_ids.length) return EMPTY_GRID(input.current);

      return contactCaller(ctx as any).mainGrid({
        ...input,
        entity: 'contact',
        pluck: CONTACT_GRID_PLUCK,
        advance_filters: buildOrChain(contact_ids, 'id', 'contacts'),
        grouping: [],
      });
    }),

  // ADD only. `role_id` is single-valued, so this is a REASSIGNMENT: it always
  // writes a real role id and never blanks one. Removal is out of scope and has
  // no defined meaning while every account form declares role_id required.
  assignUsers: privateProcedure
    .input(
      z.object({
        user_role_id: z.string().min(1),
        contact_ids: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user_role_id, contact_ids } = input;
      const meta_header = await get_meta_header();
      const organization_id = currentOrganizationId(ctx);

      const response = await ctx.dnaClient
        .findAll({
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'contact_id', 'organization_id'],
            order: { limit: 1000 },
            advance_filters: buildOrChain(
              contact_ids,
              'contact_id',
              'account_organizations',
            ),
          },
        })
        .execute();

      // Org scoping is what keeps one click in one organization from rewriting
      // the same person's role in every OTHER organization they belong to.
      const account_organization_ids = scopeToOrganization(
        (response?.data ?? []) as Record<string, any>[],
        organization_id,
      )
        .map((row) => readRowField(row, 'id'))
        .filter(Boolean) as string[];

      return Promise.all(
        account_organization_ids.map((id) =>
          ctx.dnaClient
            .update(id, {
              entity: 'account_organizations',
              token: ctx.token.value,
              ...meta_header,
              mutation: {
                params: { role_id: user_role_id },
                pluck: ['id', 'role_id', 'contact_id'],
              },
            })
            .execute(),
        ),
      );
    }),

  updateUserRoleWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: 'user_roles',
          token: ctx.token.value,
          mutation: {
            params: {
              tags,
            },
          },
        })
        .execute();
    }),
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

  getRoleByName : privateProcedure
   .input(z.object({ role_name: z.string().min(1) }))
  .query(async ({ input, ctx }) => {
    const { role_name } = input;
    const role = await ctx.dnaClient
     .findAll({
        entity: 'user_roles',
        token: ctx.token.value,
        query: {
          pluck: ['id','status'],
          advance_filters: createAdvancedFilter({ role: role_name }),
          order: {
            limit: 1,
            by_field: 'created_date',
            by_direction: EOrderDirection.DESC,
          },
        }
     })
    .execute();
    return role;
  })
});

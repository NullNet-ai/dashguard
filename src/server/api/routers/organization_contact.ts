import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { EStatus } from '../types';

const entity = 'organization_contacts';

export const organizationContactsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  update: privateProcedure
    .input(
      z.object({
        contact_id: z.string().min(1),
        contact_organization_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { contact_id, contact_organization_ids } = input;

      const findAll = async ({
        _entity,
        pluck,
        adv_filter,
      }: {
        _entity: string;
        pluck: string[];
        adv_filter: Record<string, any>;
      }) => {
        return await ctx.dnaClient
          .findAll({
            entity: _entity,
            token: ctx.token.value,
            query: {
              order: {
                limit: 100,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
              pluck,
              advance_filters: createAdvancedFilter(adv_filter),
            },
          })
          .execute();
      };

      const org_contacts: any = await findAll({
        _entity: 'organization_contacts',
        pluck: ['id'],
        adv_filter: { contact_id },
      });

      const org_contact_ids = org_contacts.data.map(
        (org: Record<string, any>) => org.id as string,
      );

      const add_params = {
        token: ctx.token.value,
        mutation: {
          params: {
            status: EStatus.ARCHIVED,
            tombstone: 1,
          },
        },
      };
      await Promise.all([
        ...org_contact_ids.map((id: string) =>
          ctx.dnaClient
            .update(id, {
              entity: 'organization_contacts',
              ...add_params,
            })
            .execute(),
        ),
      ]);
      //create new records
      const create_contact_orgs = await Promise.all(
        contact_organization_ids.map(async (org_id: string, index: number) => {
          const contact_org = await ctx.dnaClient
            .create({
              entity: 'organization_contacts',
              token: ctx.token.value,

              mutation: {
                pluck: ['id'],
                params: {
                  contact_id,
                  contact_organization_id: org_id,
                  status: EStatus.ACTIVE,
                  is_primary: index === 0 ? true : false,
                },
              },
            })
            .execute();

          return [contact_org];
        }),
      );

      return create_contact_orgs;

      //fetch all and archive, then create new.
    }),

  fetchOrganizations: privateProcedure
    .input(
      z.object({
        contact_id: z.string().optional(),
        code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { contact_id: _cntct_id, code } = input || {};

      let contact_id: any = _cntct_id;

      if (!contact_id) {
        const contact = await ctx.dnaClient
          .findAll({
            entity: 'contacts',
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: code! }),
            },
          })
          .execute();

        contact_id = contact.data?.[0]?.id;
      }

      const org_contacts: any = await ctx.dnaClient
        .findAll({
          entity: 'organization_contacts',
          token: ctx.token.value,
          query: {
            pluck_object: {
              organizations: ['id', 'name', 'categories'],
              organization_contacts: [
                'id',
                'contact_organization_id',
                'is_primary',
              ],
            },
            advance_filters: [
              {
                type: 'criteria',
                field: 'contact_id',
                operator: EOperator.EQUAL,
                values: [contact_id],
                entity: 'organization_contacts',
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria',
                field: 'categories',
                operator: EOperator.CONTAINS,
                values: ['Department'],
                entity: 'organizations',
              },
            ],
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
              entity,
              field: 'contact_organization_id',
            },
          },
        })
        .execute();

      return {
        data: {
          organizations: org_contacts.data.map((org: Record<string, any>) => {
            const { id, name } = org?.organizations ?? {};
            return {
              value: id,
              label: name,
            };
          }),
        },
      };
    }),
  fetchOrganizationsWithPrimaryOrg: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const org_contacts: any = await ctx.dnaClient
        .findAll({
          entity: 'organization_contacts',
          token: ctx.token.value,
          query: {
            pluck_object: {
              organizations: ['id', 'name'],
              organization_contacts: [
                'id',
                'contact_organization_id',
                'is_primary',
              ],
            },
            advance_filters: createAdvancedFilter({
              contact_id: input.contact_id,
            }),
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
              entity,
              field: 'contact_organization_id',
            },
          },
        })
        .execute();

      return org_contacts;
    }),
});

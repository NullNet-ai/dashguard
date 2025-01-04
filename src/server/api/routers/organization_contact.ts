import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { EStatus } from "../types";

const entity = "organization_contacts";

export const organizationContactsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  update: privateProcedure
    .input(
      z.object({
        contact_id: z.string().min(1),
        contact_organization_ids: z.array(z.string()),
        user_role_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { contact_id, contact_organization_ids, user_role_ids } = input;

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
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
              pluck,
              advance_filters: createAdvancedFilter(adv_filter),
            },
          })
          .execute();
      };

      const org_contacts: any = await findAll({
        _entity: "organization_contacts",
        pluck: ["id"],
        adv_filter: { contact_id },
      });

      const org_contact_ids = org_contacts.data.map(
        (org: Record<string, any>) => org.id as string,
      );

      const org_contacts_user_roles = await findAll({
        _entity: "organization_contact_user_roles",
        pluck: ["id"],
        adv_filter: { organization_contact_id: org_contact_ids },
      });

      const org_contacts_user_role_ids = org_contacts_user_roles.data.map(
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
      //archive all but archived all user_roles first
      await Promise.all([
        ...org_contacts_user_role_ids.map((id: string) =>
          ctx.dnaClient
            .update(id, {
              entity: "organization_contact_user_roles",
              ...add_params,
            })
            .execute(),
        ),
      ]);
      await Promise.all([
        ...org_contact_ids.map((id: string) =>
          ctx.dnaClient
            .update(id, {
              entity: "organization_contacts",
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
              entity: "organization_contacts",
              token: ctx.token.value,

              mutation: {
                pluck: ["id"],
                params: {
                  contact_id,
                  contact_organization_id: org_id,
                  status: EStatus.ACTIVE,
                  is_primary: index === 0 ? true : false,
                },
              },
            })
            .execute();

          //create contact_organization user roles

          const org_roles = await Promise.all(
            user_role_ids.map(async (user_role_id: string) => {
              return await ctx.dnaClient
                .create({
                  entity: "organization_contact_user_roles",
                  token: ctx.token.value,
                  mutation: {
                    params: {
                      organization_contact_id: contact_org.data?.[0]?.id,
                      user_role_id,
                      status: EStatus.ACTIVE,
                    },
                  },
                })
                .execute();
            }),
          );
          return [...org_roles, contact_org];
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
            entity: "contacts",
            token: ctx.token.value,
            query: {
              pluck: ["id"],
              advance_filters: createAdvancedFilter({ code: code! }),
            },
          })
          .execute();

        contact_id = contact.data?.[0]?.id;
      }

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
              entity,
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
        data: {
          organizations: org_contacts.data.map((org: Record<string, any>) => {
            const { id, name } = org?.organizations;
            return {
              value: id,
              label: name,
            };
          }),
          user_roles: org_contact_user_roles.data?.map(
            ({ user_roles }: Record<string, any>) => {
              const { id, role } = user_roles;
              return {
                value: id,
                label: role,
              };
            },
          ),
        },
      };
    }),
});

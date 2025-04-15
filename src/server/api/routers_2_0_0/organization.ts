import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import Bluebird from 'bluebird'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'

const ENTITY = 'organization'

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
      if (!input?.id) return null
      const { pluck_fields } = input
      const org_id = ctx.session?.account?.organization.id

      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
          },
        })
        .execute()

      const data = record?.data?.[0]
      const p_org
        = pluck_fields.includes('parent_organization_id')
          && !data?.parent_organization_id

      return {
        ...record,
        data: {
          ...data,
          ...(p_org && {
            parent_organization_id: org_id,
          }),
        } as Record<string, any>,
      }
    }),
  getCurrentLoginOrg: privateProcedure
    .input(
      z.object({
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck_fields } = input
      const org_id = ctx.session?.account?.organization.id

      const record = await ctx.dnaClient
        .findOne(org_id, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
          },
        })
        .execute()

      const [current_org] = record?.data || []

      return current_org
    }),
  update: privateProcedure
    .input(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1)
            .optional(),
          tags: z.array(z.string()).optional(),
        })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.name) {
        const advance_filters = createAdvancedFilter({
          name: input.name,
        })

        const org = await ctx.dnaClient
          .findAll({
            entity: ENTITY,
            token: ctx.token.value,
            query: {
              pluck: ['id', 'status'],
              advance_filters,
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        if (org.data.length > 0 && org?.data[0]?.id !== input.id) {
          const { id: existing_id, status } = org?.data[0] || {}
          return {
            message: 'Organization already exists',
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
                  field: 'name',
                  message: 'Name already exists.',
                },
              ],
            },
          }
        }
      }
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: 'organization',
          token: ctx.token.value,
          mutation: {
            params: {
              name: input.name,
              organization_id: ctx.session.account.organization_id,
              tags: input.tags,
            },
          },
        })
        .execute()

      return res
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
        entity: string
        pluck: string[]
        advance_filters: IAdvanceFilters<string | number>[]
        limit?: number
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
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()
      }
      const orgs = await filter({
        entity: ENTITY,
        pluck: ['id', 'name'],
        advance_filters: [
          {
            type: 'criteria',
            field: 'status',
            operator: EOperator.EQUAL,
            values: ['Active'],
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'id',
            operator: EOperator.NOT_EQUAL,
            values: [input.id],
          },
        ],
      })
      return orgs.data?.map((item) => {
        const { id, name } = item
        return {
          value: id,
          label: name,
        }
      })
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
              status: 'Archive',
            },
          },
        })
        .execute()
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
                input?.parent_organization_id
                ?? ctx.session.account.organization_id,
              organization_id: ctx.session.account.organization_id,
            },
          },
        })
        .execute()
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
        .execute()

      const { data: parentOrg } = await ctx.dnaClient
        .findOne(data?.[0]?.parent_organization_id, {
          entity: ENTITY,
          query: {
            pluck: input?.pluck,
          },
          token: ctx.token.value,
        })
        .execute()

      const response = data?.map((item) => {
        return {
          ...item,
          parent_organization: parentOrg?.[0],
        }
      })

      return response
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
              status: 'Archive',
            },
          },
        })
        .execute()
    }),
  getOrganizationByParentIds: privateProcedure
    .input(z.object({ parent_organization_ids: z.array(z.string()).min(1) }))
    .query(async ({ input, ctx }) => {
      const { parent_organization_ids } = input
      const filter = async ({
        entity,
        pluck,
        advance_filters,
        limit,
      }: {
        entity: string
        pluck: string[]
        advance_filters: IAdvanceFilters<string | number>[]
        limit?: number
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
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        return data
      }

      const filter_data = await filter({
        entity: 'organizations',
        pluck: ['id', 'name', 'organization_id', 'contact_id'],
        advance_filters: [
          {
            type: 'criteria',
            field: 'status',
            operator: EOperator.EQUAL,
            values: ['Active'],
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'parent_organization_id',
            operator: EOperator.EQUAL,
            values: parent_organization_ids,
          },
        ],
      })

      return filter_data
    }),
  getCurrentUserSubOrganizations: privateProcedure.query(async ({ ctx }) => {
    const current_org = ctx.session?.account?.organization_id

    const advance_filters = createAdvancedFilter({
      parent_organization_id: current_org,
      status: 'Active',
    })
    const { data } = await ctx.dnaClient
      .findAll({
        entity: 'organizations',
        token: ctx.token.value,
        query: {
          pluck: ['id', 'name'],
          advance_filters,
          order: {
            limit: 100,
            by_field: 'created_date',
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute()

    return data
  }),
  updateOrganizationsWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input

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
        .execute()
    }),

  getOrgSummary: privateProcedure
    .input(
      z.object({
        code: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.code) return null

      const record = await ctx.dnaClient
        .findByCode(input.code, {
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute()

      const advance_filters = createAdvancedFilter({
        id: record?.data?.[0]?.parent_organization_id,
      })
      const { data } = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
            advance_filters,
          },
        })
        .execute()

      return {
        ...record,
        data: { ...record?.data?.[0], parent_organization: data?.[0]?.name },
      }
    }),
  getOrgWithContact: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null
      const advance_filters = createAdvancedFilter({
        contact_organization_id: input.id,
      })
      const record = await ctx.dnaClient
        .findAll({
          entity: 'organization_contact',
          token: ctx.token.value,
          query: {
            advance_filters,
            pluck: input.pluck_fields,
            pluck_object: {
              organization_contacts: ['id', 'contact_organization_id'],
              contacts: ['organization_id', 'status'],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'organization_contact',
              field: 'contact_id',
            },
          },
        })
        .execute()

      if (record.data?.[0]?.contacts?.status === 'Active') {
        return record.data[0].organization_contacts
      }
      return null
    }),
  fetchGridItems: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      // Default limit = 10 items per page, default current page = 1
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        entity,
      } = input
      // Calculate the number of items to skip based on the current page
      // Fetch the total count of users

      /**
       *
       * @Logic to get filters from the grid tab
       *
       */

      const join_type
        = input?.entity === 'contact'
          ? 'self'
          : ('left' as 'self' | 'left' | 'right' | 'inner')

      const created_by_join = {
        type: join_type,
        field_relation:
          join_type === 'self'
            ? {
                to: {
                  entity,
                  field: 'created_by',
                },
                from: {
                  ...(join_type === 'self' ? { alias: 'created_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              }
            : {
                from: {
                  entity,
                  field: 'created_by',
                },
                to: {
                  ...(join_type === 'left' ? { alias: 'created_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              },
      }
      const updated_by_join = {
        type: join_type,
        field_relation:
          join_type === 'self'
            ? {
                to: {
                  entity,
                  field: 'updated_by',
                },
                from: {
                  ...(join_type === 'self' ? { alias: 'updated_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              }
            : {
                from: {
                  entity,
                  field: 'updated_by',
                },
                to: {
                  ...(join_type === 'left' ? { alias: 'updated_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              },
      }

      const pluck_object = {
        contacts: ['first_name', 'last_name'],
        [pluralize(input?.entity)]: input.pluck,
      }

      const query = ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
          order: {
            starts_at:
              // current 5 *  input.limit 50 = 250
              (input.current || 0) === 0
                ? 0
                : (input.current || 1) * (input.limit || 100)
                  - (input.limit || 100),
            limit: input.limit || 1,
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
          multiple_sort: input.sorting?.length
            ? formatSorting(input.sorting)
            : [],
        },
      })
      if (pluck_object) {
        query.join(created_by_join).join(updated_by_join)
      }
      const { total_count: totalCount = 1, data: items }
        = await query.execute()

      const fetchOrgWithContact = async (itemId: string) => {
        const advance_filters = createAdvancedFilter({
          contact_organization_id: itemId,
        })
        const record = await ctx.dnaClient
          .findAll({
            entity: 'organization_contact',
            token: ctx.token.value,
            query: {
              advance_filters,
              pluck: ['contact_organization_id'],
              pluck_object: {
                organization_contacts: ['id', 'contact_organization_id'],
                contacts: ['organization_id', 'status'],
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'contact',
                field: 'id',
              },
              from: {
                entity: 'organization_contact',
                field: 'contact_id',
              },
            },
          })
          .execute()

        if (record.data?.[0]?.contacts?.status === 'Active') {
          return record.data[0].organization_contacts
        }
        return null
      }

      let formatted_items = []

      // Map over the items and add the organization_contact field
      if (items?.length) {
        formatted_items = await Bluebird.map(
          items, async (item: Record<string, any>) => {
            const itemID = item[pluralize(input.entity)].id
            const organization_contact = await fetchOrgWithContact(itemID)
            return {
              ...item,
              organization_contact,
            }
          },
        )

        formatted_items = formatted_items?.map((item: Record<string, any>) => {
          const {
            [pluralize(input?.entity)]: entity_data,
            created_by,
            updated_by,
            ...rest
          } = item
          return {
            ...entity_data,
            ...rest,
            created_by: created_by
              ? `${created_by.first_name} ${created_by.last_name}`
              : null,
            updated_by: updated_by
              ? `${updated_by.first_name} ${updated_by.last_name}`
              : null,
          }
        })
      }

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),
})

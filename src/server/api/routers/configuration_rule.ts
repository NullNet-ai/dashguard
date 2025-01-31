import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'
const entity = 'device_rules'
export const deviceRuleRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  mainGrid: privateProcedure
  // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
      } = input

      
      const pluck_object = {
        device_rules: [
          'device_id',
          'type',
          'action',
          'protocol',
          'source_port',
          'source_addr',
          'destination_port',
          'destination_addr',
          'description',
          'device_rule_status',
          'created_by',
          'updated_by',
          'created_date',
          'updated_date',
        ],
        contacts: ['first_name', 'last_name', 'id'],
        organization_accounts: ['contact_id', 'id'],
        // updated_by: ['first_name', 'last_name', 'id'],
        // device_created_by: ['id', 'instance_name'],
        // device_updated_by: ['id', 'instance_name'],

      }

      const device_rules = await ctx.dnaClient.findAll({
        entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          // pluck_object,
          advance_filters: _advance_filters as IAdvanceFilters[],
          order: {
            starts_at:
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
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'organization_accounts',
        //       field: 'id',
        //     },
        //     from: {
        //       entity,
        //       field: 'created_by',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'contacts',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'organization_accounts',
        //       field: 'contact_id',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'organization_accounts',
        //       alias: 'organization_account_updated_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity,
        //       field: 'updated_by',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'contacts',
        //       alias: 'updated_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'organization_accounts',
        //       field: 'contact_id',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'organization_accounts',
        //       alias: 'device_organization_account_created_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'devices',
        //       field: 'updated_by',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'devices',
        //       alias: 'device_created_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'organization_accounts',
        //       field: 'device_id',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'organization_accounts',
        //       alias: 'device_organization_account_updated_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'devices',
        //       field: 'updated_by',
        //     },
        //   },
        // })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'devices',
        //       alias: 'device_updated_by',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'organization_accounts',
        //       field: 'device_id',
        //     },
        //   },
        // })
        .execute()

      const { total_count: totalCount = 1, data: items }
      = device_rules
      

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          updated_by,
          contacts,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          created_by: contacts?.length
            ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
            : null,
          updated_by: updated_by?.length
            ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
            : null,
        }
      })

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),
    // mainGridT: privateProcedure
    // // Define input using zod for validation
    // .input(ZodItems)
    // .query(async ({ input, ctx }) => {
    //   const {
    //     limit = 50,
    //     current = 1,
    //     advance_filters: _advance_filters = [],

    //     // pluck_object: _pluck_object,
    //     pluck,
    //   } = input

    //   const pluck_object = {
    //     contacts: ['first_name', 'last_name', 'id'],
    //     organization_accounts: ['contact_id', 'id'],
    //     device_rules:  [
    //       'device_id',
    //       'type',
    //       'device_rule_action',
    //       'protocol',
    //       'source_port',
    //       'source_addr',
    //       'destination_port',
    //       'destination_addr',
    //       'description',
    //       'device_rule_status',
    //       'created_by',
    //       'updated_by',
    //       'created_date',
    //       'updated_date',
    //       'status',
    //     ],
    //     // updated_by: ['first_name', 'last_name', 'id'],
    //     // device_groups: ['device_group_setting_id', 'device_id', 'id'],
    //     // device_group_settings: ['name', 'id'],
    //     // device_created_by: ['id', 'instance_name'],
    //     // device_updated_by: ['id', 'instance_name'],
    //     // devices: [
    //     //   'id',
    //     //   'instance_name',
    //     // ],
    //   }

    //   const query = await ctx.dnaClient.findAll({
    //     entity: 'device_rules',
    //     token: ctx.token.value,
    //     query: {
    //       // pluck: input.pluck,
    //       pluck_object,
    //       advance_filters: [...(_advance_filters as IAdvanceFilters[])],
    //       order: {
    //         starts_at:
    //           // current 5 *  input.limit 50 = 250
    //           (input.current || 0) === 0
    //             ? 0
    //             : (input.current || 1) * (input.limit || 100)
    //               - (input.limit || 100),
    //         limit: input.limit || 1,
    //         by_field: 'code',
    //         by_direction: EOrderDirection.DESC,
    //       },
    //       multiple_sort: input.sorting?.length
    //         ? formatSorting(input.sorting)
    //         : [],
    //     },
    //   }) 
    //   .join({
    //     type: 'left',
    //     field_relation: {
    //       to: {
    //         entity: 'organization_accounts',
    //         field: 'id',
    //       },
    //       from: {
    //         entity: 'device_rules',
    //         field: 'created_by',
    //       },
    //     },
    //   })
    //   .join({
    //     type: 'left',
    //     field_relation: {
    //       to: {
    //         entity: 'contacts',
    //         field: 'id',
    //       },
    //       from: {
    //         entity: 'organization_accounts',
    //         field: 'contact_id',
    //       },
    //     },
    //   }).execute()

    //   if (pluck_object) {

    //     
    //     // query
    //     //   .join({
    //     //     type: 'left',
    //     //     field_relation: {
    //     //       to: {
    //     //         entity: 'organization_accounts',
    //     //         field: 'id',
    //     //       },
    //     //       from: {
    //     //         entity: 'device_rules',
    //     //         field: 'created_by',
    //     //       },
    //     //     },
    //     //   })
    //     //   .join({
    //     //     type: 'left',
    //     //     field_relation: {
    //     //       to: {
    //     //         entity: 'contacts',
    //     //         field: 'id',
    //     //       },
    //     //       from: {
    //     //         entity: 'organization_accounts',
    //     //         field: 'contact_id',
    //     //       },
    //     //     },
    //     //   })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'organization_accounts',
    //       //       alias: 'organization_account_updated_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'devices',
    //       //       field: 'updated_by',
    //       //     },
    //       //   },
    //       // })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'contacts',
    //       //       alias: 'updated_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'organization_accounts',
    //       //       field: 'contact_id',
    //       //     },
    //       //   },
    //       // })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'organization_accounts',
    //       //       alias: 'device_organization_account_created_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'devices',
    //       //       field: 'updated_by',
    //       //     },
    //       //   },
    //       // })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'devices',
    //       //       alias: 'device_created_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'organization_accounts',
    //       //       field: 'device_id',
    //       //     },
    //       //   },
    //       // })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'organization_accounts',
    //       //       alias: 'device_organization_account_updated_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'devices',
    //       //       field: 'updated_by',
    //       //     },
    //       //   },
    //       // })
    //       // .join({
    //       //   type: 'left',
    //       //   field_relation: {
    //       //     to: {
    //       //       entity: 'devices',
    //       //       alias: 'device_updated_by',
    //       //       field: 'id',
    //       //     },
    //       //     from: {
    //       //       entity: 'organization_accounts',
    //       //       field: 'device_id',
    //       //     },
    //       //   },
    //       // })
    //   }

    //   
    //   const { total_count: totalCount = 1, data: items }
    //   =  query
    //   

    //   const formatted_items = items?.map((item: Record<string, any>) => {
    //     const {
    //       [entity]: entity_data,
    //       updated_by,
    //       contacts,
    //       ...rest
    //     } = item

    //     return {
    //       ...entity_data,
    //       ...rest,
    //       created_by: contacts?.length
    //         ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
    //         : null,
    //       updated_by: updated_by?.length
    //         ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
    //         : null,
    //     }
    //   })

    //   // Calculate total number of pages
    //   const totalPages = Math.ceil(totalCount / limit)
    //   return {
    //     totalCount, // Total number of users
    //     items: formatted_items, // Paginated users
    //     currentPage: current, // The current page
    //     totalPages, // Total number of pages
    //   }
    // }),

    mainGridT: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        
        pluck_object: _pluck_object,
      } = input
      

      const pluck_object = {
        contacts: ['first_name', 'last_name', 'id'],
        organization_accounts: ['contact_id', 'id', 'device_id'],
        devices: [
          'id',
          'created_by',
          'updated_by',
          'created_date',
          'updated_date',
          'code',
          'status',
          'instance_name',
          'model',
        ],
        updated_by: ['first_name', 'last_name', 'id'],
        device_created_by: ['id', 'instance_name'],
        device_updated_by: ['id', 'instance_name'],
        device_rules: input.pluck
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
        query
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'organization_accounts',
                field: 'id',
              },
              from: {
                entity: "device_rules",
                field: 'created_by',
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
                entity: 'organization_accounts',
                field: 'contact_id',
              },
            },
          })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'organization_accounts',
          //       alias: 'organization_account_updated_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'devices',
          //       field: 'updated_by',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'contacts',
          //       alias: 'updated_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'organization_accounts',
          //       field: 'contact_id',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'organization_accounts',
          //       alias: 'device_organization_account_created_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'devices',
          //       field: 'updated_by',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'devices',
          //       alias: 'device_created_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'organization_accounts',
          //       field: 'device_id',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'organization_accounts',
          //       alias: 'device_organization_account_updated_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'devices',
          //       field: 'updated_by',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'devices',
          //       alias: 'device_updated_by',
          //       field: 'id',
          //     },
          //     from: {
          //       entity: 'organization_accounts',
          //       field: 'device_id',
          //     },
          //   },
          // })
      }
      const { total_count: totalCount = 1, data: items }
      = await query.execute()
      

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          updated_by,
          contacts,
          device_group_settings,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          hierarchy: device_group_settings
            ?.map((setting: { name: string }) => setting.name)
            .join(', '),
          created_by: contacts?.length
            ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
            : null,
          updated_by: updated_by?.length
            ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
            : null,
        }
      })

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount, // Total number of users
        items: formatted_items, // Paginated users
        currentPage: current, // The current page
        totalPages, // Total number of pages
      }
    }),
})

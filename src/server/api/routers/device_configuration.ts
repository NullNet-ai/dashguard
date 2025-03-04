// import z from "zod";
import { EOperator, EOrderDirection } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
  // privateProcedure
} from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
const entity = 'device_configurations'
export const deviceConfigurationRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  fetchDeviceRawData: privateProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              device_configurations: [
                'id',
                'device_id',
                'raw_content',
                'status',
              ],
              devices: [
                'id', 'code',
              ],
            },
            advance_filters: [{
              type: 'criteria',
              field: 'code',
              entity: 'devices',
              operator: EOperator.EQUAL,
              values: [
                input.code,
              ],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'status',
              entity: 'device_configurations',
              operator: EOperator.EQUAL,
              values: [
                'Active',
              ],
            }],
            order: {
              limit: 1,
              by_field: 'timestamp',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'devices',
              field: 'id',
            },
            from: {
              entity,
              field: 'device_id',
            },
          },
        })
        .execute()

      const raw_content = res?.data?.[0]?.raw_content

      const decodedString = raw_content ? atob(raw_content) : ''

      return decodedString
    }),
  fetchDeviceConfigurations: privateProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input
      const res = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'code', 'updated_date', 'updated_time', 'updated_by', 'created_date', 'created_time', 'created_by'],
            pluck_object: {
              devices: ['id', 'code'],
              contacts: ['first_name', 'last_name', 'id'],
              organization_accounts: ['contact_id', 'id', 'device_id'],
              organization_account_updated_by: ['contact_id', 'id', 'device_id'],
              device_configurations: ['id', 'device_id', 'created_by', 'updated_by', 'created_date', 'created_time', 'updated_date', 'updated_time', 'code', 'config_version'],
            },
            advance_filters: [{
              type: 'criteria',
              field: 'code',
              entity: 'devices',
              operator: EOperator.EQUAL,
              values: [
                code,
              ],
            }],
            // @ts-expect-error - order is not defined
            order: {
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'device_configurations',
              field: 'device_id',
            },
            from: {
              entity: 'devices',
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'id',
            },
            from: {
              entity: 'device_configurations',
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              alias: 'organization_account_updated_by',
              field: 'id',
            },
            from: {
              entity: 'device_configurations',
              field: 'updated_by',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contacts',
              alias: 'updated_by',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'contact_id',
            },
          },
        })
        .execute()

      const modifiedData = res?.data?.[0]?.device_configurations?.map((item: any) => {
        if (!item?.organization_accounts?.[0]?.contact_id) {
          return {
            ...item,
            created_by: 'Wallguard Client',
            updated_by: 'Wallguard Client',
          }
        }
        
        return item
      })
      
      return { items: modifiedData, totalCount: res?.data?.[0]?.device_configurations?.length }
    }),
  fetchInterfaceOptions:  privateProcedure
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const res = await ctx.dnaClient
      .findAll({
        entity,
        token: ctx.token.value,
        query: {

          pluck_object: {
            device_configurations: [
              'id',
              'device_id',
            ],
            devices: [
              'id', 'code',
            ],
            device_interfaces:[
              'name',
              "device",
              "id"
            ]
          },
          advance_filters: [{
            type: 'criteria',
            field: 'code',
            entity: 'devices',
            operator: EOperator.EQUAL,
            values: [
              input.code,
            ],
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'status',
            entity: 'device_configurations',
            operator: EOperator.EQUAL,
            values: [
              'Active',
            ],
          }],
          order: {
            limit: 1,
            by_field: 'timestamp',
            by_direction: EOrderDirection.DESC,
          }
        },
      })
   
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'devices',
            field: 'id',
          },
          from: {
            entity,
            field: 'device_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'device_interfaces',
            field: 'device_configuration_id',
          },
          from: {
            entity,
            field: 'id',
          },
        },
      })
      .execute()

      
      const data = res?.data?.[0]?.device_interfaces
      const drpdwn_optn = data?.map((item: {
        name: string
        device: string
      }) => {
        const { device , name} = item
        return {
          label: `${name.toUpperCase()} (${device})`,
          value: device
        }
      })
      
      return drpdwn_optn
  }),
})

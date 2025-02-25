import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { CredentialsGenerator } from '~/server/utils/credentials'
import { formatSorting } from '~/server/utils/formatSorting'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import { transformResMessage } from '~/server/utils/transformResponseMessage'
import { DeviceBasicDetailsSchema } from '~/server/zodSchema/device/deviceBasicDetails'
import ZodItems from '~/server/zodSchema/grid/items'
import Bluebird from 'bluebird';


import { createDefineRoutes } from '../baseCrud'
import { getActualDownloadURL } from '~/app/api/device/get_actual_download_url'

const entity = 'device'

export const deviceRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateBasicDetails: privateProcedure
    .input(
      DeviceBasicDetailsSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, grouping, model, country, city, state, ...rest } = input

      const modifyDeviceAddress = async () => {
        const find_res = await ctx.dnaClient
          .findOne(id!, {
            entity,
            token: ctx.token.value,
            query: {
              pluck: ['address_id'],
            },
          })
          .execute()

        const { address_id } = find_res?.data[0] || {}

        let address_res

        if (address_id) {
          address_res = await ctx.dnaClient
            .update(address_id, {
              entity: 'addresses',
              token: ctx.token.value,
              mutation: {
                params: {
                  country,
                  city,
                  state,
                },
              },
            })
            .execute()
        }
        else {
          address_res = await ctx.dnaClient
            .create({
              entity: 'addresses',
              token: ctx.token.value,
              mutation: {
                params: {
                  country,
                  city,
                  state,
                  entity_prefix: 'AD',
                },
              },
            })
            .execute()
        }

        return address_res?.data?.[0]?.id || address_id
      }

      const address_id = await modifyDeviceAddress()

      // filter all device_groups with device_id
      // update to new grouoping id
      const modifyDeviceGroup = async () => {
        const filter_device_group = await ctx.dnaClient
          .findAll({
            entity: 'device_groups',
            token: ctx.token.value,
            query: {
              pluck: ['id', 'status'],
              advance_filters: createAdvancedFilter({ device_id: id }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        if (filter_device_group.data.length) {
          const { id: existing_id } = filter_device_group?.data[0] || {}
          await ctx.dnaClient
            .update(existing_id, {
              entity: 'device_groups',
              token: ctx.token.value,
              mutation: {
                params: {
                  device_id: id,
                  device_group_setting_id: grouping || null,
                  status: 'Active',
                },
              },
            })
            .execute()
        }
        else {
          await ctx.dnaClient
            .create({
              entity: 'device_groups',
              token: ctx.token.value,
              mutation: {
                params: {
                  device_id: id,
                  device_group_setting_id: grouping,
                  status: 'Active',
                  entity_prefix: 'DG',
                },
              },
            })
            .execute()
        }
      }

      const res = await Promise.all([
        await ctx.dnaClient
          .update(id, {
            entity,
            token: ctx.token.value,
            mutation: {
              params: {
                ...rest,
                address_id,
                model,
              },
            },
          })
          .execute(),
        modifyDeviceGroup(),
      ])

      return {
        ...res?.[0],
        data: res,
      }
    }),
  mainGrid: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
        pluck_object: _pluck_object,
        sorting
      } = input

      const pluck_object = {
        contacts: ['first_name', 'last_name', 'id'],
        organization_accounts: ['contact_id', 'id', 'device_id'],
        devices: pluck,
        updated_by: ['first_name', 'last_name', 'id'],
        device_groups: ['device_group_setting_id', 'device_id', 'id'],
        device_group_settings: ['name', 'id'],
        device_created_by: ['id', 'instance_name'],
        device_updated_by: ['id', 'instance_name'],
        device_interfaces: ['id', 'device_configuration_id', 'name', 'address'],
        device_configurations: ['id', 'device_id', 'hostname', 'created_date', 'created_time', 'timestamp'],
      }

      const query = ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        query: {
          track_total_records: true,
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
          multiple_sort: sorting?.length
            ? formatSorting(sorting)
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
                entity: 'devices',
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
                entity: 'devices',
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
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'organization_accounts',
                alias: 'device_organization_account_created_by',
                field: 'id',
              },
              from: {
                entity: 'devices',
                field: 'created_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'devices',
                alias: 'device_created_by',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'device_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'organization_accounts',
                alias: 'device_organization_account_updated_by',
                field: 'id',
              },
              from: {
                entity: 'devices',
                field: 'updated_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'devices',
                alias: 'device_updated_by',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'device_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_groups',
                field: 'device_id',
              },
              from: {
                entity: input?.entity,
                field: 'id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_group_settings',
                field: 'id',
              },
              from: {
                entity: 'device_groups',
                field: 'device_group_setting_id',
              },
            },
          })
          .join( {
            "type": "left",
            "field_relation": {
                "to": {
                    "entity": "device_configurations",
                    "field": "device_id",
                    "order_by": "timestamp",
                    "limit": 1,
                    order_direction:EOrderDirection.DESC,
                },
                "from": {
                    "entity": "devices",
                    "field": "id"
                }
            }
        })
        .join({
            "type": "left",
            "field_relation": {
                "to": {
                    "entity": "device_interfaces",
                    "field": "device_configuration_id",
                    "order_by": "timestamp",
                    "limit": 1,
                    order_direction:EOrderDirection.DESC,
                    filters:[
                        {
                            field: "name",
                            type: "criteria",
                            operator: EOperator.EQUAL,
                            values:[ "wan"]
                        }
                    ]
                },
                "from": {
                    "entity": "device_configurations",
                    "field": "id"
                }
            }
        })
      }
      const { total_count: totalCount = 0, data: items }
      = await query.execute()
      
      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          updated_by,
          contacts,
          device_group_settings,
          device_updated_by,
          device_created_by,
          device_interfaces,
          device_configurations,
          ...rest
        } = item;
      
      
        const wan_address = device_interfaces?.[0]?.address;
      
        return {
          ...entity_data,
          ...rest,
          hierarchy: device_group_settings
            ?.map((setting: { name: string }) => setting.name)
            .join(', '),
          created_by: contacts?.length
            ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
            : device_created_by?.length
              ? `${device_created_by?.[0].instance_name}`
              : null,
          ip_address: wan_address,
          updated_by: updated_by?.length
            ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
            : device_updated_by?.length
              ? `${device_updated_by?.[0].instance_name}`
              : null,
        };
      });
      

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount, // Total number of users
        items: formatted_items, // Paginated users
        currentPage: current, // The current page
        totalPages, // Total number of pages
      }
    }),

  fetchBasicDetails: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const { id: device_id, code } = input
      let id = device_id
      if (!device_id) {
        const res = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: code! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        id = res.data[0]?.id
      }

      const res = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck_object: {
                devices: [
                  'id',
                  'model',
                  'instance_name',
                  'address_id',
                  'created_date',
                  'updated_date',
                  'categories',
                ],
                addresses: ['id', 'country', 'city', 'state'],
              },
              advance_filters: createAdvancedFilter({ id: id! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'addresses',
                field: 'id',
              },
              from: {
                entity,
                field: 'address_id',
              },
            },
          })
          .execute(),
        await ctx.dnaClient
          .findAll({
            entity: 'device_groups',
            token: ctx.token.value,
            query: {
              pluck_object: {
                device_group_settings: ['id', 'name'],
                device_groups: ['id', 'device_group_setting_id'],
              },
              advance_filters: createAdvancedFilter({ device_id: id! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_group_settings',
                field: 'id',
              },
              from: {
                entity: 'device_groups',
                field: 'device_group_setting_id',
              },
            },
          })
          .execute(),
      ])

      // return res;
      const [devices, device_group] = res

      const { id: device_group_setting_id, name }
        = device_group.data[0]?.device_group_settings?.[0] || {}
      const { addresses, ...rest } = devices?.data?.[0] || {}
      const { id: add_id, ...rest_address } = addresses?.[0] || {}

      return {
        data: {
          ...rest,
          ...rest_address,
          grouping: device_group_setting_id,
          grouping_name: name,
        },
      }
    }),

  createOrganizationAccount: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const advance_filters = createAdvancedFilter({ device_id: id })
      const find_res = await ctx.dnaClient
        .findAll({
          entity: 'organization_account',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'account_id', 'device_id'],
            advance_filters,
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      if (!find_res.data[0]) {
        const { organization_id } = ctx.session.account

        const account_id = CredentialsGenerator.generateAppId()
        const account_secret = CredentialsGenerator.generateAppSecret()

        const hashed_account_secret = await argon2.hash(account_secret)

        const reg_res = await ctx.dnaClient
          .create({
            entity: 'organization_account',
            token: ctx.token.value,
            mutation: {
              params: {
                account_id,
                account_secret: hashed_account_secret,
                organization_id,
                entity_prefix: 'OA',
                categories: ['Device'],
                device_id: id,
              },
              pluck: ['id', 'account_id'],
            },
          })
          .execute()

        if (!reg_res.success) {
          throw new Error(`Failed to create an account for device ${id}`)
        }

        // set by device_id:app_id to app_id
        // set by app_id:app_secret to app_secret

        await ctx.redisClient.cacheData(`${id}:${account_id}`, { account_secret, expiration: 60 * 60 * 24 * 7 })

        return {
          account_id,
          account_secret,
          message: transformResMessage(reg_res?.message),
        }
      }

      return {
        account_id: find_res.data[0].account_id,
        message: transformResMessage(find_res?.message),
      }
    }),

  updateDeviceSetup: privateProcedure
    .input(
      z.object({
        id: z.string(),
        instance_name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, instance_name } = input

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              instance_name,
            },
            pluck: ['id', 'instance_name'],
          },
        })
        .execute()

      return {
        ...res,
        data: res,
      }
    }),

  fetchOrganizationAccount: privateProcedure
    .input(
      z.object({
        code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input

      const advance_filters = createAdvancedFilter({ code: code! })

      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              device: ['id'],
              organization_account: ['id', 'account_id', 'device_id'],
            },
            advance_filters,
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_account',
              field: 'device_id',
            },
            from: {
              entity,
              field: 'id',
            },
          },
        })
        .execute()

      return {
        data: res.data[0],
      }
    }),

  updateDeviceSetting: privateProcedure
    .input(
      z.object({
        id: z.string(),
        is_monitoring_enabled: z.boolean().optional(),
        is_remote_access_enabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, is_monitoring_enabled, is_remote_access_enabled } = input

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              is_monitoring_enabled,
              is_remote_access_enabled,
            },
            pluck: ['id', 'is_monitoring_enabled', 'is_remote_access_enabled'],
          },
        })
        .execute()

      return {
        ...res,
        data: res,
      }
    }),
  fetchDeviceConnectionStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input

      const find_res = await ctx.dnaClient
        .findOne(id!, {
          entity,
          token: ctx.token.value,
          query: {
            pluck: ['is_connection_established', 'status'],
          },
        })
        .execute()

      const cookieStore = cookies()
      const cookieName = `encrypted_token_${id}`
      if (find_res?.data?.[0]?.status?.toLowerCase() === 'active') {
        cookieStore.set(cookieName, '', { expires: new Date(0) })
      }

      return {
        is_connection_established:
          !!find_res?.data?.[0]?.is_connection_established,
      }
    }),
  updateDeviceConnectionStatus: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              is_connection_established: true,
            },
            pluck: ['id', 'is_connection_established'],
          },
        })
        .execute()

      return res
    }),

  fetchSetupDetails: privateProcedure
    .input(
      z.object({
        code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input

      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            // pluck: ["id", "instance_name"],
            pluck_object: {
              device: ['id', 'instance_name'],
              organization_account: ['id', 'account_id', 'account_name'],
            },
            advance_filters: createAdvancedFilter({ code: code! }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        // .join({
        //   type: "left",
        //   field_relation: {
        //     to: {
        //       entity: "organization_account",
        //       field: "id",
        //     },
        //     from: {
        //       entity,
        //       field: "organization_account_id",
        //     },
        //   },
        // })
        .execute()

      return {
        server_url: process.env.SERVER_URL,
      }
    }),

  updateOrganizationAccount: privateProcedure
    .input(
      z.object({
        id: z.string(),
        account_secret: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, account_secret } = input
      const advance_filters = createAdvancedFilter({ device_id: id })
      const find_res = await ctx.dnaClient
        .findAll({
          entity: 'organization_account',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'account_id', 'device_id'],
            advance_filters,
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      const hashed_account_secret = await argon2.hash(account_secret)

      const response = await ctx.dnaClient
        .update(find_res?.data[0]?.id, {
          entity: 'organization_account',
          token: ctx.token.value,
          mutation: {
            params: {
              account_secret: hashed_account_secret,
              device_id: id,
            },
            pluck: ['id', 'account_id'],
          },
        })
        .execute()

      return {
        account_id: find_res?.data[0]?.account_id,
        message: transformResMessage(response?.message),
      }
    }),

  getByCodeWithJoin: privateProcedure
    // Define input using zod for validation
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, pluck_fields, main_entity: entity } = input

      const pluck_object = {
        created_by_data: ['first_name', 'last_name', 'id'],
        updated_by_data: ['first_name', 'last_name', 'id'],
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
        device_groups: ['device_group_setting_id', 'device_id', 'id'],
        device_group_settings: ['name', 'id'],
        device_created_by: ['id', 'instance_name'],
        device_updated_by: ['id', 'instance_name'],
      }
      const _advance_filters = createAdvancedFilter({
        code: id,
      })

      const query = ctx.dnaClient.findAll({
        entity,
        token: ctx.token.value,
        query: {
          pluck: pluck_fields,
          pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
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
                entity: 'devices',
                field: 'created_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'contacts',
                alias: 'created_by_data',
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
                entity: 'devices',
                field: 'updated_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'contacts',
                alias: 'updated_by_data',
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
                alias: 'device_organization_account_created_by',
                field: 'id',
              },
              from: {
                entity: 'devices',
                field: 'updated_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'devices',
                alias: 'device_created_by',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'device_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'organization_accounts',
                alias: 'device_organization_account_updated_by',
                field: 'id',
              },
              from: {
                entity: 'devices',
                field: 'updated_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'devices',
                alias: 'device_updated_by',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'device_id',
              },
            },
          })
      }

      const response = await query.execute()

      return {
        ...response,
        data: {
          ...response.data[0],
          code: response.data[0]?.code,
          status: response.data[0]?.status,
          created_date: response.data[0]?.created_date,
          updated_date: response.data[0]?.updated_date,
          created_time: response.data[0]?.created_time,
          updated_time: response.data[0]?.updated_time,
          updated_by_data: response.data[0]?.updated_by_data?.[0],
          created_by_data: response.data[0]?.created_by_data?.[0],
        },
      }
    }),

  getSetupDetails: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, pluck_fields, main_entity: entity } = input
      if (!id) return null
      try {
        const recordByCode = await ctx.dnaClient.findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck: pluck_fields,
            pluck_object: {
              devices: pluck_fields,
              organization_accounts: ['contact_id', 'id', 'device_id', 'account_id'],
            },
            advance_filters: createAdvancedFilter({ code: id }),
          },
        }).join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_account',
              field: 'device_id',
            },
            from: {
              entity,
              field: 'id',
            },
          },
        })
          .execute()
        const { data, ...rest } = recordByCode ?? {}
        const { id: device_id, organization_accounts } = data?.[0] ?? {}

        const fetch_account_secret = await ctx.redisClient.getCachedData(`${device_id}:${organization_accounts?.[0]?.account_id}`)

        const { account_secret } = fetch_account_secret ?? {}

        return {
          ...rest,
          data: { id: device_id, account_secret, ...data?.[0] },
        }
      }
      catch (error) {
        return {
          data: undefined,
          status_code: 404,
          message: 'Record not found',
          success: false,
          error,
        } as Record<string, any>
      }
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
      if (!input?.id) return null
      try {
        const recordByCode = await ctx.dnaClient
          .findByCode(input.id, {
            entity: input.main_entity,
            token: ctx.token.value,
            query: {
              pluck: input.pluck_fields,
            },
          })
          .execute()
        const { data, ...rest } = recordByCode ?? {}
        return {
          ...rest,
          data: data?.[0],
        }
      }
      catch (error) {
        return {
          data: undefined,
          status_code: 404,
          message: 'Record not found',
          success: false,
          error,
        } as Record<string, any>
      }
    }),

  fetchRecordShellSummary: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const { id: device_id, code } = input
      let id = device_id
      if (!device_id) {
        const res = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: code! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        id = res.data[0]?.id
      }

      const res = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: [
                'id',
                'model',
                'instance_name',
                'address_id',
                'created_date',
                'updated_date',
                'categories',
                'host_name',
                'device_version',
                'updated_time',
                'created_time',
                'ip_address',
              ],
              pluck_object: {
                device: [
                  'id',
                  'model',
                  'instance_name',
                  'address_id',
                  'created_date',
                  'updated_date',
                  'categories',
                  'host_name',
                  'device_version',
                  'ip_address',
                ],
                addresses: ['id', 'country', 'city', 'state'],
                device_heartbeats: ['id', 'device_id', 'timestamp'],
              },
              advance_filters: createAdvancedFilter({ id: id! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                // by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute(),


        await ctx.dnaClient
          .findAll({
            entity: 'device_groups',
            token: ctx.token.value,
            query: {
              pluck_object: {
                device_group_settings: ['id', 'name'],
                device_groups: ['id', 'device_group_setting_id'],
              },
              advance_filters: createAdvancedFilter({ device_id: id! }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_group_settings',
                field: 'id',
              },
              from: {
                entity: 'device_groups',
                field: 'device_group_setting_id',
              },
            },
          })
          .execute(),
      ])
      const [device, device_group] = res

      const fetchConfiguration = await Bluebird.map(device?.data, async (item: Record<string, any>) => {
        const configurations = await ctx.dnaClient.findAll({
          entity: 'device_configurations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({ device_id: item?.id }),
            pluck: ['id', 'device_id', 'created_date', 'created_time', 'device_configuration_id', 'hostname'],
          },
        }).execute();
      
        // Sort configurations by created_date and created_time to get the latest one
        const sortedConfigurations = configurations.data.sort((a: Record<string, any>, b: Record<string, any>) => {
          const dateA = new Date(`${a.created_date}T${a.created_time}`);
          const dateB = new Date(`${b.created_date}T${b.created_time}`);
          return dateB.getTime() - dateA.getTime();
        });
      
        return sortedConfigurations[0]; // Return the latest configuration
      })?.filter(Boolean);
      
      
      const fetchDeviceInterfaces = await Bluebird.map(fetchConfiguration, async (item) => {
        if (!item) return null; // Handle case where there is no configuration
        
        const interfaces = await ctx.dnaClient.findAll({
          entity: 'device_interfaces',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({ device_configuration_id: item.id }),
            pluck: ['id', 'device_configuration_id', 'name', 'address'],
          },
        }).execute();
      
        return {
          configuration: item,
          interfaces: interfaces.data,
        };
      });

      const configuration: any = fetchDeviceInterfaces.find((config: any) => config.configuration.device_id === device?.data?.[0]?.id);

      const { id: device_group_setting_id, name }
          = device_group.data[0]?.device_group_settings?.[0] || {}
      // const { hostname } = device_configuration.data[0] || {}
      // const { device_interfaces } = device_configuration?.data?.[0] || {}
      const { addresses, device_heartbeats, ...rest } = device?.data?.[0] || {}
      const { id: add_id, ...rest_address } = addresses?.[0] || {}

      return {
        data: {
          ...rest,
          ...rest_address,
          hostname: configuration?.configuration?.hostname,
          interfaces: configuration?.interfaces,
          grouping: device_group_setting_id,
          grouping_name: name,
        },
      }
    }),

  deleteDevice: privateProcedure.input(z.object({ id: z.string() })).mutation(
    async ({ input, ctx }) => {
      const { id } = input

      const deleteRecords = async (
        _entity: string,
        advance_filters: IAdvanceFilters[],
      ) => {
        const filter_res = await ctx.dnaClient
          .findAll({
            entity: _entity,
            token: ctx.token.value,
            query: {
              track_total_records: true,
              pluck: ['id'],
              advance_filters,
              order: {
                limit: 500,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

          const { total_count = 1 } = filter_res

        const ids = filter_res.data.map((item: Record<string, any>) => item?.id)
        if (!ids.length) return { success: true, message: 'No records found' }
        // return ids
        // return ids
        // return true
        // return await Promise.all(
        //   ids.map(async (id: string) => {
        //     return await ctx.dnaClient
        //       .delete(id, {
        //         entity: _entity,
        //         token: ctx.token.value,
        //         is_permanent: true,
        //       })
        //       .execute()
        //   }),
        // )
          await Bluebird.map(
          ids,
          async (_id: string) => {
            return await ctx.dnaClient
              .delete(_id, {
                entity: _entity,
                token: ctx.token.value,
                is_permanent: true,
              })
              .execute();

          },
          { concurrency: 10 },
          
        );

        
        if (total_count > 500) {
         return await deleteRecords(
            _entity,
            advance_filters,
          )
        }
        return `${_entity} deleted successfully.`
      
      }

      const related_entities = {
        devices: 'id',
        device_groups: 'device_id',
        organization_accounts: 'device_id',
        device_configurations: 'device_id',
        device_rules: 'device_configuration_ids',
        device_aliases: 'device_configuration_ids',
        device_interfaces: 'device_configuration_ids',
        // device_heartbeats: 'device_id',
        // packets: 'device_id',
      }

      const filter_configurations = await ctx.dnaClient.findAll({
        entity: 'device_configurations',
        token: ctx.token.value,
        query: {
          pluck: ['id'],
          advance_filters: createAdvancedFilter({ device_id: id }),
        },
      }).execute()

      const device_configuration_ids = filter_configurations.data.map((item: Record<string, any>) => item?.id)

      const advance_filters = {
        device_id: createAdvancedFilter({ device_id: id }),
        device_configuration_id: createAdvancedFilter({ device_configuration_id: device_configuration_ids }),
        id: createAdvancedFilter({ id }),
      }

      //  Promise.allSettled(
      //   Object.entries(related_entities).map(async ([entity, field]) => {
          // const filters = advance_filters[field as keyof typeof advance_filters]

          // if (!filters?.[0]?.values?.length) return { success: true, message: 'No records found' }
          // return await deleteRecords(entity, filters)
      //   }),
      // )

      Bluebird.map(
        Object.entries(related_entities),
        async ([_entity, field]) => {
          // return await ctx.dnaClient
          //   .delete(id, {
          //     entity: _entity,
          //     token: ctx.token.value,
          //     is_permanent: true,
          //   })
          //   .execute();

          const filters = advance_filters[field as keyof typeof advance_filters]

          if (!filters?.[0]?.values?.length) return { success: true, message: 'No records found' }
          return await deleteRecords(_entity, filters)
          // console.log('%c Line:1383 🍣 a', 'color:#4fff4B', _entity, JSON.stringify(a,null,2));
          // return a
        },
        { concurrency: 1 },
      );

      return {
        success: true,
        message: 'Device deleted successfully',
      }
    },
  ),

  fetchDownloadURL: privateProcedure
  .input(z.object({})).query(async ({ctx }) => {
   
    const url = await getActualDownloadURL()

    if(url){
       ctx.redisClient.cacheData('pfsense-package-url', { url});
      return url
    }

    const cachedUrl = await ctx.redisClient.getCachedData('pfsense-package-url')
    if(cachedUrl){
        return cachedUrl
      }

      return ''
    
  }
  ),
})

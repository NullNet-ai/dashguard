import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EDateFormats, EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { DeviceBasicDetailsSchema } from '~/server/zodSchema/device/deviceBasicDetails';
import { getActualDownloadURL } from '~/app/api/device/get_actual_download_url';
import { transformResMessage } from '~/server/utils/transformResponseMessage';
import argon2 from 'argon2'
import { CredentialsGenerator } from '~/app/portal/device/_components/actions/credentialGenerator';
import pluralize from 'pluralize';
import { formatSorting } from '~/server/utils/formatSorting';
import ZodItems from '~/server/zodSchema/grid/items';
import { cookies } from 'next/headers';
import Bluebird from 'bluebird';
import { addCommonGridJoins, addCommonGridPluckObject } from '~/server/utils/queryBuilder';

const entity = 'devices';
const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

// Define the return type interface
interface IDeviceAccountSetupResponse {
  data: Array<{
    devices: {
      id: string;
      code: string;
    };
    account_organizations: {
      id: string;
      email: string;
      status: string;
      device_id: string;
      app_secret: string;
      account_id: string;
    };
  }>;
  success: boolean;
  message: string;
  status_code: number;
}

export const deviceRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getAccountSetUpDetailsByDeviceCode: privateProcedure
    .input(
      z.object({
        device_code: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { device_code } = input;

      const accountDetails = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'code',
                operator: EOperator.EQUAL,
                values: [device_code],
              },
            ],
            pluck_object: {
              devices: ['id', 'code'],
              account_organizations: [
                'id',
                'email',
                'status',
                'device_id',
                'account_id',
              ],
              accounts: [
                'id',
                'account_id'
              ]
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'account_organizations',
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
            from: {
              entity: 'account_organizations',
              field: 'account_id',
            },
            to: {
              entity: 'accounts',
              field: 'id',
            },
          },
        })
        .execute();

      // fetch device app secret from redis via app id

      const key = `account_id:${accountDetails?.data?.[0]?.account_organizations?.email}`;
      const response = await ctx.redisClient.getCachedData(key);

      const returnData = {
        ...accountDetails,
        data: [
          {
            ...accountDetails?.data?.[0],
            account_organizations: {
              ...accountDetails?.data?.[0]?.account_organizations,
              app_secret: response?.account_secret,
            },
          },
        ],
      };
      
      return returnData as IDeviceAccountSetupResponse;
    }),

  activateDevice: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;
      const deviceInfo = await ctx.dnaClient
      .findByCode(input.device_id, {
        entity: 'devices',
        token: ctx.token.value,
        query: {
          pluck: [
            'id',
            'code',
            'status',
          ],
        },
      })
      .execute();
      
      const deviceRecord = deviceInfo?.data?.[0];
      // fetch account organization via device_id
      
      const accountOrganization = await ctx.dnaClient
      .findAll({
        entity: 'account_organizations',
        token: rootAccountToken,
        as_root: true,
        query: {
          advance_filters: createAdvancedFilter({
            device_id: deviceRecord?.id,
          }),
          pluck_object: {
            account_organizations: [
              'id',
              'status',
              'account_id',
              'account_organization_status'
            ],
            accounts: ['id', 'status', 'account_status'],
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'accounts',
            field: 'id',
          },
          from: {
            entity: 'account_organizations',
            field: 'account_id',
          },
        },
      })
      .execute();

      const accountOrganizationRecord = accountOrganization?.data?.[0]?.account_organizations;
      const accountRecord = accountOrganization?.data?.[0]?.accounts;
      
      try {
        const [account] = await Promise.all([
          // ctx.dnaClient
          //   .update(deviceRecord?.id, {
          //     entity: 'devices',
          //     token: rootAccountToken,
          //     as_root: true,
          //     mutation: {
          //       pluck: ['id', 'code', 'status'],
          //       params: {
          //         status: 'Active',
          //       },
          //     },
          //   })
          //   .execute(),
          ctx.dnaClient
            .update(accountRecord?.id, {
              entity: 'accounts',
              token: rootAccountToken,
              as_root: true,
              mutation: {
                pluck:  ['id', 'status', 'account_status', 'account_id'],
                params: {
                  status: 'Active',
                  account_status: 'Active',
                },
              },
            })
            .execute(),
          ctx.dnaClient
            .update(accountOrganizationRecord?.id, {
              entity: 'account_organizations',
              token: rootAccountToken,
              as_root: true,
              mutation: {
                pluck:  [
                  'id',
                  'status',
                  'account_id',
                  'account_organization_status'
                ],
                params: {
                  status: 'Active',
                  account_organization_status: 'Active',
                },
              },
            })
            .execute(),
        ]);

        const _account = account?.data?.[0];
        const fetch_account_secret = await ctx.redisClient.getCachedData(`${deviceRecord?.id}:${_account?.account_id}`)

      

        const { account_secret } = fetch_account_secret ?? {}
        // Return the updated records
        return {
          account: _account,
          success: true,
          message: 'Device activated successfully',
          status_code: 200
        };
      } catch (error : any) {
        // Handle any errors that occur during the updates
        throw new Error(`Failed to activate device: ${error.message}`);
      }
    }),
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
                state
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
                status: 'Active'
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
              pluck: [
                'id',
                'model',
                'instance_name',
                'address_id',
                'created_date',
                'updated_date',
                'categories',
              ],
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

      const [deviceRes, groupRes] = res; // res is your array

      const deviceData = deviceRes?.data?.[0] ?? {};
      const groupData = groupRes?.data?.[0] ?? {};

      const { devices, addresses } = deviceData;
      const { device_group_settings } = groupData;

      return {
        data: {
          ...devices,
          ...addresses,
          id: devices?.id,
          grouping: device_group_settings?.id,
          grouping_name: device_group_settings?.name,
        },
      };
    }),

  fetchDownloadURL: privateProcedure
  .input(z.object({})).query(async ({ ctx }) => {
    const url = await getActualDownloadURL()

    if (url) {
      ctx.redisClient.cacheData('pfsense-package-url', { url })
      return url
    }

    const cachedUrl = await ctx.redisClient.getCachedData('pfsense-package-url')

    if (cachedUrl) {
      return cachedUrl?.url
    }

    return ''
  }
  ),
  fetchSetupDetails: privateProcedure
    .input(
      z.object({
        code: z.string().optional(),
      }),
    )
    .query(async ({  }) => {
      // const { code } = input

      // const res = await ctx.dnaClient
        // .findAll({
        //   entity,
        //   token: ctx.token.value,
        //   query: {
        //     // pluck: ["id", "instance_name"],
        //     pluck_object: {
        //       device: ['id', 'instance_name'],
        //       organization_account: ['id', 'account_id', 'account_name'],
        //     },
        //     advance_filters: createAdvancedFilter({ code: code! }),
        //     order: {
        //       limit: 1,
        //       by_field: 'created_date',
        //       by_direction: EOrderDirection.DESC,
        //     },
        //   },
        // })
        // // .join({
        // //   type: "left",
        // //   field_relation: {
        // //     to: {
        // //       entity: "organization_account",
        // //       field: "id",
        // //     },
        // //     from: {
        // //       entity,
        // //       field: "organization_account_id",
        // //     },
        // //   },
        // // })
        // .execute()

      return {
        server_url: process.env.SERVER_URL,
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
            account_organizations: ['contact_id', 'id', 'device_id', 'account_id', 'email'],
            accounts: ['id', 'account_id']
          },
          advance_filters: createAdvancedFilter({ code: id }),
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'account_organizations',
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
      const { devices, account_organizations } = data?.[0] ?? {}
      const {id: device_id} = devices ?? {}

      const fetch_account_secret = await ctx.redisClient.getCachedData(`account_id:${account_organizations?.email}`)
      

      const { account_secret, account_id } = fetch_account_secret ?? {}

      return {
        ...rest,
        data: { id: device_id, account_secret,account_id, ...data?.[0] },
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
          entity: 'account_organizations',
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

      const find_accounts = await ctx.dnaClient
      .findAll({
        entity: 'accounts',
        token: ctx.token.value,
        query: {
          pluck: ['id', 'account_id'],
          advance_filters: createAdvancedFilter({ id: find_res?.data[0]?.account_id }),
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
        .update(find_accounts?.data[0]?.id, {
          entity: 'accounts',
          token: ctx.token.value,
          mutation: {
            params: {
              account_secret: hashed_account_secret,
            },
            pluck: ['id', 'account_id'],
          },
        })
        .execute()

      return {
        account_id: find_accounts?.data[0]?.account_id,
        message: transformResMessage(response?.message),
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
        entity: 'account_organizations',
        token: ctx.token.value,
          query: {
            pluck: ['id', 'account_id', 'device_id'],
            pluck_object: {
              account_organizations: ['contact_id', 'id', 'device_id', 'account_id'],
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
            from: {
              entity: 'account_organizations',
              field: 'account_id',
            },
            to: {
              entity: 'accounts',
              field: 'id',
            },
          },
        })
        .execute()

      const account_response = await ctx.dnaClient
      .findAll({
        entity: 'accounts',
        token: ctx.token.value,
        query: {
            pluck: ['id', 'account_id', 'device_id'],
            pluck_object: {},
            advance_filters: createAdvancedFilter({ id: find_res?.data[0]?.account_organizations?.account_id }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        }).execute()
      if (!account_response?.data?.length) {
        const { organization_id } = ctx.session.account

        const account_id = CredentialsGenerator.generateAppId()
        const account_secret = CredentialsGenerator.generateAppSecret()

        const hashed_account_secret = await argon2.hash(account_secret)
        const _account = await ctx.dnaClient
        .create({
          entity: 'accounts',
            token: ctx.token.value,
            mutation: {
              params: {
                account_id,
                account_secret: hashed_account_secret,
                organization_id
                // categories: ['Device'],
                // device_id: id,
              },
              pluck: ['id', 'account_id'],
            },
          })
          .execute()
          
          const _account_organization = await ctx.dnaClient
          .create({
            entity: 'account_organizations',
            token: ctx.token.value,
            mutation: {
              params: {
                account_id: _account?.data?.[0]?.id,
                categories: ['Device'],
                device_id: id,
              },
              pluck: ['id', 'account_id'],
            },
          })
          .execute()

        if (!_account_organization.success) {
          throw new Error(`Failed to create an account for device ${id}`)
        }

        // set by device_id:app_id to app_id
        // set by app_id:app_secret to app_secret

        await ctx.redisClient.cacheData(`${id}:${account_id}`, { account_secret, expiration: 60 * 60 * 24 * 7 })
        
        return {
          account_id,
          account_secret,
          message: transformResMessage(_account_organization?.message),
        }
      }

      return {
        account_id: account_response?.data?.[0]?.account_id,
        message: transformResMessage(find_res?.message),
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
        sorting = [],
        is_case_sensitive_sorting = 'false',
      } = input
      
      const pluck_object = {
        ...addCommonGridPluckObject(),
        contacts: ['first_name', 'last_name', 'id', 'previous_status'],
        organization_accounts: ['contact_id', 'id', 'device_id'],
        organizations: ['id', 'name', 'categories'],
        organization_contacts: ['id', 'contact_organization_id'],
        devices: pluck,
        device_group_devices: ['device_group_setting_id', 'device_id', 'id'],
        device_groups: ['device_group_setting_id', 'device_id', 'id'],
        device_group_settings: ['name', 'id'],
        device_interfaces: ['id', 'device_configuration_id', 'name'],
        device_interface_addresses: ['id', 'device_interface_id', 'address'],
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
          // @ts-expect-error - multiple_sort is not defined in the type
          multiple_sort: sorting?.length
            ? formatSorting(sorting, entity, is_case_sensitive_sorting)
            : [],
          date_format: 'YYYY/mm/dd' as EDateFormats,
          concatenate_fields: [
            {
              fields: [
                'first_name',
                'last_name',
              ],
              field_name: 'contact_created_by',
              separator: ' ',
              entity: 'contacts',
              aliased_entity: 'contacts',
            },
            {
              fields: [
                'first_name',
                'last_name',
              ],
              field_name: 'contact_updated_by',
              separator: ' ',
              entity: 'contacts',
              aliased_entity: 'contacts',
            },

          ],
        },
      })
      if (pluck_object) {
        query
          .join({
            type: 'left',
            field_relation: {
              to: {
                alias: 'device_group_devices',
                entity: 'device_groups',
                field: 'device_id',
              },
              from: {
                entity: input?.entity,
                field: 'id',
              },
            },
          })
          .nestedJoin({
            type: 'left',
            nested: true,
            field_relation: {
              to: {
                entity: 'device_group_settings',
                field: 'id',
              },
              from: {
                entity: 'device_group_devices',
                field: 'device_group_setting_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_configurations',
                field: 'device_id',
                order_by: 'timestamp',
                limit: 1,
                order_direction: EOrderDirection.DESC,
              },
              from: {
                entity: input?.entity,
                field: 'id',
              },
            },
          })
          //!! TO BE TESTED BY THE DB TEAM
          // .nestedJoin({
          //   type: 'left',
          //   nested: true,
          //   field_relation: {
          //     to: {
          //       entity: 'device_interfaces',
          //       field: 'device_configuration_id',
          //       order_by: 'timestamp',
          //       limit: 1,
          //       order_direction: EOrderDirection.DESC,
          //       filters: [
          //         {
          //           field: 'name',
          //           type: 'criteria',
          //           operator: EOperator.EQUAL,
          //           values: ['wan'],
          //         },
          //       ],
          //     },
          //     from: {
          //       entity: 'device_configurations',
          //       field: 'id',
          //     },
          //   },
          // })
          // .join({
          //   type: 'left',
          //   field_relation: {
          //     to: {
          //       entity: 'device_interface_addresses',
          //       field: 'device_interface_id',
          //       order_by: 'timestamp',
          //       limit: 50,
          //       order_direction: EOrderDirection.DESC,
          //     },
          //     from: {
          //       entity: 'device_interfaces',
          //       field: 'id',
          //     },
          //   },
          // })
      }

      addCommonGridJoins(query, 'devices')
      const { total_count: totalCount = 0, data: items }
      = await query.execute()

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          updated_by,
          device_group_settings,
          device_interface_addresses,
          ...rest
        } = item

        const wan_addresses = device_interface_addresses?.map(({ address = '' }: { address: string }) => address)

        return {
          ...entity_data,
          ...rest,
          hierarchy: device_group_settings?.name,
          wan_addresses,
          created_by: !!created_by?.first_name || !!created_by?.last_name
            ? `${created_by?.first_name} ${created_by?.last_name}`
            : null,
          updated_by: updated_by?.first_name || updated_by?.last_name
            ? `${updated_by?.first_name} ${updated_by?.last_name}`
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
            pluck: ['id', 'device_id', 'created_date', 'created_time', 'hostname'],
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            }
          },
          
        }).execute()

        // Sort configurations by created_date and created_time to get the latest one
        const sortedConfigurations = configurations.data.sort((a: Record<string, any>, b: Record<string, any>) => {
          const dateA = new Date(`${a.created_date}T${a.created_time}`)
          const dateB = new Date(`${b.created_date}T${b.created_time}`)
          return dateB.getTime() - dateA.getTime()
        })

        return sortedConfigurations[0] // Return the latest configuration
      })?.filter(Boolean)

      const fetchDeviceInterfaces = await Bluebird.map(fetchConfiguration, async (item) => {
        if (!item) return null // Handle case where there is no configuration

        const interfaces = await ctx.dnaClient.findAll({
          entity: 'device_interfaces',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({ device_configuration_id: item.id }),
            pluck: ['id', 'device_configuration_id', 'name'],
            pluck_object: {
              device_interfaces: ['id', 'device_configuration_id', 'name'],
              device_interface_addresses: ['id', 'device_interface_id', 'address'],
            },
          },
        })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'device_interface_addresses',
                field: 'device_interface_id',
                order_by: 'timestamp',
                limit: 50,
                order_direction: EOrderDirection.DESC,
              },
              from: {
                entity: 'device_interfaces',
                field: 'id',
              },
            },
          })
          .execute()

        return {
          configuration: item,
          interfaces: interfaces.data,
        }
      })

      const configuration: any = fetchDeviceInterfaces.find((config: any) => config.configuration.device_id === device?.data?.[0]?.id)

      const transformed_device_interface_address = configuration?.interfaces?.map((iface: Record<string, any>) => ({
        name: iface.name,
        address: iface.device_interface_addresses.length
        ? iface.device_interface_addresses[0].address
        : null,
      }));
      const { id: device_group_setting_id, name }
          = device_group.data[0]?.device_group_settings || {}
      // const { hostname } = device_configuration.data[0] || {}
      // const { device_interfaces } = device_configuration?.data?.[0] || {}
      const { addresses, ...rest } = device?.data?.[0] || {}
      const {  ...rest_address } = addresses?.[0] || {}

      return {
        data: {
          ...rest,
          ...rest_address,
          hostname: configuration?.configuration?.hostname,
          interfaces: transformed_device_interface_address,
          grouping: device_group_setting_id,
          grouping_name: name,
        },
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
});

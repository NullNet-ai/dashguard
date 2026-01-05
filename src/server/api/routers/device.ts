import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import Bluebird from 'bluebird'
import { WallGuardApi } from '~/utils/wallguard-api';
import { authorizeDevice } from '~/app/api/device/authorize_device';

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
              devices: ['id', 'code', 'device_category'],
              account_organizations: [
                'id',
                'email',
                'status',
                'device_id',
                'account_id',
              ],
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
        const [device, account, accountOrg] = await Promise.all([
          ctx.dnaClient
            .update(deviceRecord?.id, {
              entity: 'devices',
              token: rootAccountToken,
              as_root: true,
              mutation: {
                params: {
                  status: 'Active',
                },
              },
            })
            .execute(),
          ctx.dnaClient
            .update(accountRecord?.id, {
              entity: 'accounts',
              token: rootAccountToken,
              as_root: true,
              mutation: {
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
                params: {
                  status: 'Active',
                  account_organization_status: 'Active',
                },
              },
            })
            .execute(),
        ]);

        // Return the updated records
        return {
          device,
          account,
          accountOrganization: accountOrg,
          success: true,
          message: 'Device activated successfully',
          status_code: 200
        };
      } catch (error : any) {
        // Handle any errors that occur during the updates
        throw new Error(`Failed to activate device: ${error.message}`);
      }
    }),
  // Project Requests
  fetchDeviceInfo: privateProcedure
    .input(
      z.object({
        code: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'code',
              'device_uuid',
              'is_traffic_monitoring_enabled',
              'is_config_monitoring_enabled',
              'is_telemetry_monitoring_enabled',
              'device_category',
              'device_type',
              'device_name',
              'device_os',
              'is_device_authorized',
              'is_device_online',
            ],
            advance_filters: createAdvancedFilter({ code: code! }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (!response.success) {
        throw new Error(
          `Failed to fetch device info: ${response.errors?.join(', ') ?? 'Unkown error'}`,
        );
      }

      return response.data[0];
    }),
  updateDeviceCategory: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        device_category: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, device_category } = input;

      return await ctx.dnaClient.update(id, {
        entity: 'devices',
        token: ctx.token.value,
        mutation: {
          params: { device_category },
        },
      });
    }),
  fetchInstallationCodeByDeviceId: privateProcedure
    .input(
      z.object({
        device_id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'installation_codes',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'code'],
            track_total_records: true,
            advance_filters: createAdvancedFilter({ device_id }),
          },
        })
        .execute();

      return response.data.length > 0 ? response.data[0] : null;
    }),
  createInstallationCode: privateProcedure
    .input(
      z.object({
        device_id: z.string().min(1),
        device_code: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, device_code } = input;

      const response = await ctx.dnaClient
        .create({
          entity: 'installation_codes',
          token: ctx.token.value,
          mutation: {
            params: {
              status: 'Active',
              device_id,
              device_code,
            },
            pluck: ['id', 'code'],
          },
        })
        .execute();

      if (!response.success)
        throw new Error(
          `Failed to create installation key: ${response.errors?.map((errMap) => errMap.message).join(' ')}`,
        );

      return response.data[0];
    }),
  fetchSetupInstructions: privateProcedure
    .input(
      z.object({
        device_category: z.string().min(1),
        device_type: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_category, device_type } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'installation_codes',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'markdown'],
            track_total_records: true,
            advance_filters: createAdvancedFilter({
              device_category,
              device_type,
            }),
          },
        })
        .execute();

      return response.data.length > 0 ? response.data[0] : null;
    }),
  updateDeviceSetting: privateProcedure
    .input(
      z.object({
        id: z.string(),
        is_traffic_monitoring_enabled: z.boolean().optional(),
        is_config_monitoring_enabled: z.boolean().optional(),
        is_telemetry_monitoring_enabled: z.boolean().optional(),
        // is_remote_access_enabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        is_traffic_monitoring_enabled,
        is_config_monitoring_enabled,
        is_telemetry_monitoring_enabled,
        // is_remote_access_enabled
       } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'device_instances',
          token: ctx.token.value,
          query: {
            pluck: ['id'],
            advance_filters: createAdvancedFilter({ device_id: id, status: 'Active' }),
          },
        })
        .execute();
        

      const instanceId = response?.data?.[response?.data?.length > 1 ? response?.data?.length - 1 : 0]?.id; 

       const wallguardApi = new WallGuardApi({
        token: ctx.token.value,
      })

      try {
        // Make parallel API calls for each monitoring setting with individual error handling
        const apiResults = []
  
        if (is_traffic_monitoring_enabled !== undefined) {
          apiResults.push(
            wallguardApi.enableTrafficMonitoring({
              device_id: id,
              instance_id: instanceId,
              enable: is_traffic_monitoring_enabled
            }).then(response => ({
              type: 'traffic_monitoring',
              success: true,
              data: response.data
            })).catch(error => ({
              type: 'traffic_monitoring',
              success: false,
              error: error.response?.data || error.message,
              status: error.response?.status
            }))
          )
        }
  
        if (is_config_monitoring_enabled !== undefined) {
          apiResults.push(
            wallguardApi.enableConfigurationMonitoring({
              device_id: id,
              instance_id: instanceId,
              enable: is_config_monitoring_enabled
            }).then(response => ({
              type: 'config_monitoring',
              success: true,
              data: response.data
            })).catch(error => ({
              type: 'config_monitoring',
              success: false,
              error: error.response?.data || error.message,
              status: error.response?.status
            }))
          )
        }
  
        if (is_telemetry_monitoring_enabled !== undefined) {
          apiResults.push(
            wallguardApi.enableTelemetryMonitoring({
              device_id: id,
              instance_id: instanceId,
              enable: is_telemetry_monitoring_enabled
            }).then(response => ({
              type: 'telemetry_monitoring',
              success: true,
              data: response.data
            })).catch(error => ({
              type: 'telemetry_monitoring',
              success: false,
              error: error.response?.data || error.message,
              status: error.response?.status
            }))
          )
        }
  
        // Execute all API calls in parallel and collect results
        const apiResponses = await Promise.all(apiResults)
  
        // Check if any API calls failed and prepare error messages
        const failedCalls = apiResponses.filter((response): response is { type: string; success: false; error: any; status: any } => !response.success)

        if (failedCalls.length > 0) {
          const errorMessages = failedCalls.map(failed => 
            `${failed.type}: ${failed.error}${failed.status ? ` (Status: ${failed.status})` : ''}`
          ).join(', ')
          
          throw new Error(`WallGuard API calls partially failed: ${errorMessages}`)
        }
  
      } catch (error) {
        console.error('Error updating device settings:', error)
        throw error
      }

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              is_traffic_monitoring_enabled,
              is_config_monitoring_enabled,
              is_telemetry_monitoring_enabled,
              // is_remote_access_enabled,
            },
            pluck: [
              'id',
              'is_traffic_monitoring_enabled',
              'is_config_monitoring_enabled',
              'is_telemetry_monitoring_enabled',
              // 'is_remote_access_enabled',
            ],
          },
        })
        .execute();

      return {
        ...res,
        data: res,
      };
    }),
    updateDeviceTypeAndName: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        device_name: z.string().min(1),
        device_type: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, device_name, device_type } = input;

      return await ctx.dnaClient.update(id, {
        entity: 'devices',
        token: ctx.token.value,
        mutation: {
          params: { device_name, device_type },
        },
      });
    }),
    fetchInstallationCodeByDeviceCode: privateProcedure
    .input(
      z.object({
        device_code: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { device_code } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'installation_codes',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'code'],
            track_total_records: true,
            advance_filters: createAdvancedFilter({ device_code }),
          },
        })
        .execute();

      return response.data.length > 0 ? response.data[0] : null;
    }),
    fetchRecordShellSummary: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const { id: device_id, code } = input;
      let id = device_id;
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
          .execute();

        id = res.data[0]?.id;
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
                'device_name',
                'address_id',
                'created_date',
                'updated_date',
                'categories',
                'host_name',
                'device_version',
                'updated_time',
                'created_time',
                'ip_address',
                'device_type',
                'device_category'
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
      ]);
      const [device, device_group] = res;

      const fetchConfiguration = await Bluebird.map(
        device?.data,
        async (item: Record<string, any>) => {
          const configurations = await ctx.dnaClient
            .findAll({
              entity: 'device_configurations',
              token: ctx.token.value,
              query: {
                advance_filters: createAdvancedFilter({ device_id: item?.id }),
                pluck: [
                  'id',
                  'device_id',
                  'created_date',
                  'created_time',
                  'hostname',
                ],
                order: {
                  limit: 1,
                  by_field: 'created_date',
                  by_direction: EOrderDirection.DESC,
                },
              },
            })
            .execute();

          // Sort configurations by created_date and created_time to get the latest one
          const sortedConfigurations = configurations.data.sort(
            (a: Record<string, any>, b: Record<string, any>) => {
              const dateA = new Date(`${a.created_date}T${a.created_time}`);
              const dateB = new Date(`${b.created_date}T${b.created_time}`);
              return dateB.getTime() - dateA.getTime();
            },
          );

          return sortedConfigurations[0]; // Return the latest configuration
        },
      )?.filter(Boolean);

      const fetchDeviceInterfaces = await Bluebird.map(
        fetchConfiguration,
        async (item) => {
          if (!item) return null; // Handle case where there is no configuration

          const interfaces = await ctx.dnaClient
            .findAll({
              entity: 'device_interfaces',
              token: ctx.token.value,
              query: {
                advance_filters: createAdvancedFilter({
                  device_configuration_id: item.id,
                }),
                pluck: ['id', 'device_configuration_id', 'name'],
                pluck_object: {
                  device_interfaces: ['id', 'device_configuration_id', 'name'],
                  device_interface_addresses: [
                    'id',
                    'device_interface_id',
                    'address',
                  ],
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
            .execute();

          return {
            configuration: item,
            interfaces: interfaces.data,
          };
        },
      );

      console.log('### fetchDeviceInterfaces', fetchDeviceInterfaces)
      const configuration: any = fetchDeviceInterfaces.find(
        (config: any) =>
          config.configuration.device_id === device?.data?.[0]?.id,
      );

      const transformed_device_interface_address =
        configuration?.interfaces?.map((iface: Record<string, any>) => ({
          name: iface.name,
          address: iface.device_interface_addresses.length
            ? iface.device_interface_addresses[0].address
            : null,
        }));
      const { id: device_group_setting_id, name } =
        device_group.data[0]?.device_group_settings || {};
      // const { hostname } = device_configuration.data[0] || {}
      // const { device_interfaces } = device_configuration?.data?.[0] || {}
      const { addresses, ...rest } = device?.data?.[0] || {};
      const { ...rest_address } = addresses?.[0] || {};

      return {
        data: {
          ...rest,
          ...rest_address,
          hostname: fetchConfiguration.length > 0 ? configuration?.configuration?.hostname : 'Need to Enable Config Monitoring',
          interfaces: fetchConfiguration.length > 0 ? transformed_device_interface_address : 'Need to Enable Config Monitoring',
          grouping: device_group_setting_id,
          grouping_name: name,
        },
      };
    }),
    authorizeDevice: privateProcedure
    .input(
      z.object({
        device_id: z.string().min(1),
        device_name: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, device_name } = input;

      await authorizeDevice(device_id, ctx.token.value);

      const response = await ctx.dnaClient
        .update(device_id, {
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: {
              device_name,
              is_device_authorized: true
            },
          },
        })
        .execute();

      if (!response.success) {
        throw new Error('Failed to update device')
      }
    }),
});

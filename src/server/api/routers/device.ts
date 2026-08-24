import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { regenerateInstallationCodeForDevice } from '~/server/utils/installationCode';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
  type IGroupAdvanceFilters,
} from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import Bluebird from 'bluebird'
import { WallGuardApi } from '~/utils/wallguard-api';
import { authorizeDevice } from '~/app/api/device/authorize_device';
import { createRootOrm } from '~/server/lib/root-orm';
import {
  addCommonGridConcatenates,
  addCommonGridJoins,
  addCommonGridPluckObject,
} from '~/server/utils/queryBuilder';
import {
  fetchLiveOnlineStatuses,
  resolveDeviceOnline,
} from '~/server/utils/deviceOnlineStatus';
import { formatSorting } from '~/server/utils/formatSorting';
import { saveLatestVersion } from '~/server/utils/latestVersion';
import { get_meta_header } from '~/utils/request-header';
import ZodItems from '~/server/zodSchema/grid/items';
import pluralize from 'pluralize';

const entity = 'devices';
const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

// Define the return type interface
interface IDeviceAccountSetupResponse {
  data: Array<{
    devices: {
      id: string;
      code: string;
      device_category?: string;
      address_id?: string;
    };
    addresses?: {
      city?: string;
      country?: string;
      state?: string;
      country_code?: string;
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

// Input wrapper: expand a "ui" protocol filter value into ['http', 'https']
// so filtering/grouping by "ui" matches both underlying protocols.
const mapProtocolFilterValuesToUi = (
  filters: IAdvanceFilters[],
): IAdvanceFilters[] =>
  filters.map((filter) =>
    filter.field === 'protocol'
      ? {
          ...filter,
          values: (filter.values as string[])?.flatMap((v) =>
            String(v).toLowerCase() === 'ui' ? ['http', 'https'] : v,
          ),
        }
      : filter,
  );

// Output wrapper: combine the "http" and "https" group_by rows into a single
// "ui" row (summing counts), representing http/https as one connection type.
// Relabel unconditionally: even if only http or only https exists, it becomes "ui".
const getRowProtocol = (row: any): string | undefined =>
  row?.device_services_protocol ??
  row?.device_services?.protocol ??
  row?.entity_data?.device_services?.protocol;

const mergeUiProtocolGroups = (rows: any[]): any[] => {
  const uiRows = rows.filter((row) =>
    ['http', 'https'].includes(getRowProtocol(row)!),
  );
  if (!uiRows.length) return rows;

  const otherRows = rows.filter(
    (row) => !['http', 'https'].includes(getRowProtocol(row)!),
  );
  const mergedCount = uiRows.reduce((sum, row) => sum + (row.count ?? 0), 0);

  const base = uiRows[0];
  const merged = {
    ...base,
    device_services_protocol: 'ui',
    count: mergedCount,
    total_group_count: Math.max(
      0,
      (base?.total_group_count ?? rows.length) - (uiRows.length - 1),
    ),
  };
  // Relabel every shape the row may carry so the client reads 'ui' regardless
  if (base?.device_services?.protocol) {
    merged.device_services = { ...base.device_services, protocol: 'ui' };
  }
  if (base?.entity_data?.device_services?.protocol) {
    merged.entity_data = {
      ...base.entity_data,
      device_services: { ...base.entity_data.device_services, protocol: 'ui' },
    };
  }

  return [...otherRows, merged];
};

export const deviceRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateDeviceWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: {
              tags,
            },
          },
        })
        .execute();
    }),
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
              devices: ['id', 'code', 'device_category', 'address_id'],
              addresses: ['city', 'country', 'state', 'country_code'],
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'addresses',
              field: 'id',
            },
            from: {
              entity: 'devices',
              field: 'address_id',
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
            devices: accountDetails.data[0],
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
  fetchLatestVersion: privateProcedure.query(async ({ ctx }) => {
    const response = await ctx.dnaClient
      .findAll({
        entity: 'versions',
        token: ctx.token.value,
        query: {
          pluck: ['latest_version'],
          order: {
            limit: 1,
            by_field: 'created_date',
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute()

    return response?.data?.[0] ?? null
  }),
  // Settings > Config edits the same single `versions` row fetchLatestVersion reads.
  updateLatestVersion: privateProcedure
    .input(z.object({ latest_version: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();

      return saveLatestVersion(
        ctx.dnaClient,
        ctx.token.value,
        input.latest_version,
        meta_header,
      );
    }),
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
          no_caching: true,
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
              'device_operating_system',
              'is_device_authorized',
              'is_device_online',
              'address_id',
              'status',
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

      const device = response.data[0]

      const responseAddresses = await ctx.dnaClient
        .findAll({
          entity: 'addresses',
          token: ctx.token.value,
          query: {
            pluck: [
              "address",
              "address_line_one",
              "address_line_two",
              "latitude",
              "longitude",
              "place_id",
              "street_number",
              "street",
              "region",
              "region_code",
              "country_code",
              "postal_code",
              "country",
              "state",
              "city",
            ],
            advance_filters: createAdvancedFilter({ id: device?.address_id }),
          },
        })
        .execute();

      return {
        ...device,
        address: responseAddresses.data?.[0]
      }
    }),
  fetchDeviceByScriptToken: privateProcedure
    .input(
      z.object({
        script_token: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { script_token } = input;

      const response = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          no_caching: true,
          token: ctx.token.value,
          query: {
            pluck: ['id', 'code', 'status', 'is_device_online'],
            advance_filters: createAdvancedFilter({ script_token }),
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
          `Failed to fetch device: ${response.errors?.join(', ') ?? 'Unknown error'}`,
        );
      }

      return response.data[0] ?? null;
    }),
  updateDeviceCategory: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        device_category: z.string().optional(),
        address_city: z.string().optional(),
        address_state: z.string().optional(),
        address_country: z.string().optional(),
        address_country_code: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, device_category } = input;
      // @ts-expect-error - No type yet
      let { address_id } = input;

      const address = {
        "country": input['address_country'],
        "state": input['address_state'],
        "city": input['address_city'],
        "country_code": input['address_country_code'],
      }

      // Create Address
      if (!address_id) {
        const response = await ctx.dnaClient
          .create({
            entity: 'addresses',
            token: ctx.token.value,
            mutation: {
              params: {
                ...address,
                created_by: ctx.token.value,
              },
              pluck: ['id'],
            },
          })
          .execute();

        if (!response.success)
          throw new Error(
            `Failed to create address: ${response.errors?.map((errMap) => errMap.message).join(' ')}`,
          );
        // @ts-expect-error - No type yet
        address_id = response.data[0].id;
      }
      // Update Address
      else {
        await ctx.dnaClient
          .update(address_id, {
            entity: 'addresses',
            token: ctx.token.value,
            mutation: {
              params: address,
            },
          })
          .execute();
      }

      return await ctx.dnaClient
        .update(id, {
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: {
              device_category,
              address_id,
            },
          },
        })
        .execute();
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
            pluck: ['id', 'token'],
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
              token: Array.from({ length: 16 }, () =>
                Math.floor(Math.random() * 16).toString(16),
              ).join(''),
            },
            pluck: ['id', 'token'],
          },
        })
        .execute();

      if (!response.success)
        throw new Error(
          `Failed to create installation key: ${response.errors?.map((errMap) => errMap.message).join(' ')}`,
        );

      return response.data[0];
    }),
  // WP-841: issue a fresh join code for an already-enrolled device.
  //
  // Deliberately NOT just another createInstallationCode call. That procedure
  // only ever inserts, and fetchInstallationCodeByDeviceId returns data[0], so
  // calling it twice would leave the device with several Active codes and the
  // record displaying an arbitrary one of them. Retiring the old rows first is
  // what makes this a regeneration rather than a duplicate.
  //
  // Note: dashguard can mark the old code Archived, but whether an archived
  // code is *rejected* at enrolment is enforced by wallguard-server, not here.
  regenerateInstallationCode: privateProcedure
    .input(
      z.object({
        device_id: z.string().min(1),
        device_code: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, device_code } = input;

      return regenerateInstallationCodeForDevice({
        orm: ctx.dnaClient as never,
        token: ctx.token.value,
        device_id,
        device_code,
      });
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

      const rootOrm = await createRootOrm(ctx.dnaClient);
      
      const response = await rootOrm
        .findAll({
          entity: 'device_instances',
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

      return await ctx.dnaClient
        .update(id, {
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: { device_name, device_type },
          },
        })
        .execute();
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
            pluck: ['id', 'token'],
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

      const rootOrm = await createRootOrm(ctx.dnaClient);

      const res = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: [
                'id',
                'device_name',
                'address_id',
                'created_date',
                'updated_date',
                'categories',
                'device_version',
                'updated_time',
                'created_time',
                'device_type',
                'device_category'
              ],
              pluck_object: {

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

        await rootOrm
          .findAll({
            entity: 'device_groups',
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
          const configurations = await rootOrm
            .findAll({
              entity: 'device_configurations',
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

          const interfaces = await rootOrm
            .findAll({
              entity: 'device_interfaces',
              query: {
                advance_filters: createAdvancedFilter({
                  device_configuration_id: item.id,
                }),
                pluck: ['id', 'device_configuration_id', 'name', 'description'],
                pluck_object: {
                  device_interfaces: ['id', 'device_configuration_id', 'name', 'description'],
                  device_interface_addresses: [
                    'id',
                    'device_interface_id',
                    'address',
                  ],
                },
                order: {
                  limit: 50,
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
            // @ts-expect-error - No type yet
            interfaces: interfaces.data.map(e => {
              return {
                ...e,
                device_interfaces: e,
                device_interface_addresses: e?.device_interface_addresses?.[0] || {},
              }
            }),
          };
        },
      );

      const configuration: any = fetchDeviceInterfaces.find(
        (config: any) =>
          config.configuration.device_id === device?.data?.[0]?.id,
      );

      const transformed_device_interface_address =
        configuration?.interfaces?.map((iface: Record<string, any>) => ({
          name: iface.device_interfaces?.description || iface.device_interfaces?.name || '',
          address: iface.device_interface_addresses?.address
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
  mainGrid: privateProcedure.input(ZodItems).query(async ({ input, ctx }) => {
    const {
      limit = 50,
      current = 1,
      advance_filters: _advance_filters = [],
      entity: inputEntity,
      sorting = [],
      group_advance_filters: _group_advance_filters = [],
    } = input;

    const baseEntity = inputEntity || 'devices';
    const pluralEntity = pluralize(baseEntity);

    const rootOrm = await createRootOrm(ctx.dnaClient);

    // Role-scoped grid: developers see only devices assigned to their own contact
    // (via device_contacts junction). Role + contact_id derived server-side from
    // the session token — never from the client — so a developer cannot view
    // another contact's devices (no IDOR). Admins are unscoped.
    let isDeveloper = false;
    let developerContactId: string | null = null;
    const accountOrgId = ctx.session.account?.account_organization_id;
    if (accountOrgId) {
      const roleResp = await rootOrm
        .findAll({
          entity: 'account_organizations',
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'id',
                operator: EOperator.EQUAL,
                values: [accountOrgId],
                entity: 'account_organizations',
              },
            ],
            pluck_object: {
              account_organizations: ['id', 'contact_id'],
              user_roles: ['role'],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: { entity: 'user_roles', field: 'id' },
            from: { entity: 'account_organizations', field: 'role_id' },
          },
        })
        .execute();

      const row = (roleResp?.data?.[0] ?? {}) as Record<string, any>;
      let user_roles = row.user_roles;
      if (Array.isArray(user_roles)) user_roles = user_roles[0];
      if ((user_roles?.role ?? '').toLowerCase() === 'developer') {
        isDeveloper = true;
        developerContactId = row.contact_id ?? null;
      }
    }

    // Fail closed: a developer with no linked contact is scoped to a sentinel
    // value that matches nothing, never the full list.
    const scoped_advance_filters = [...(_advance_filters as any[])];
    if (isDeveloper) {
      if (scoped_advance_filters.length) {
        scoped_advance_filters.push({
          type: 'operator',
          operator: EOperator.AND,
        });
      }
      scoped_advance_filters.push({
        type: 'criteria',
        field: 'contact_id',
        operator: EOperator.EQUAL,
        values: [developerContactId ?? '__no_contact__'],
        entity: 'device_contacts',
      });
    }

    const query = rootOrm.findAll({
      entity: baseEntity,
      no_caching: true,
      query: {
        pluck: input.pluck,
        track_total_records: true,
        pluck_object: {
          ...addCommonGridPluckObject(),
          [pluralEntity]: input.pluck,
          device_services: ['protocol', 'status'],
          ...(isDeveloper
            ? { device_contacts: ['device_id', 'contact_id'] }
            : {}),
        },
        pluck_group_object: {
          device_services: ['protocol', 'status'],
        },
        advance_filters: mapProtocolFilterValuesToUi(
          scoped_advance_filters as IAdvanceFilters[],
        ),
        group_advance_filters: (
          _group_advance_filters as IGroupAdvanceFilters<string | number>[]
        )?.map((group) => ({
          ...group,
          filters: mapProtocolFilterValuesToUi(
            group.filters as IAdvanceFilters[],
          ) as typeof group.filters,
        })),
        order: {
          starts_at:
            (input.current || 0) === 0
              ? 0
              : (input.current || 1) * (input.limit || 100) -
                (input.limit || 100),
          limit: input.limit || 1,
          by_field:
            sorting?.length === 1
              ? ((sorting[0] as any)?.sort_key ?? sorting[0]?.id)
              : 'code',
          by_direction:
            sorting?.length === 1
              ? sorting[0]?.desc
                ? EOrderDirection.DESC
                : EOrderDirection.ASC
              : EOrderDirection.DESC,
          is_case_sensitive_sorting: true,
        },
        multiple_sort:
          sorting?.length && sorting.length > 1
            ? // @ts-expect-error - No type yet
              formatSorting(sorting)
            : [],
        concatenate_fields: [...addCommonGridConcatenates(pluralEntity)],
      },
    });

    query.join({
      type: 'left',
      field_relation: {
        to: { entity: 'device_services', field: 'device_id' },
        from: { entity: baseEntity, field: 'id' },
      },
    });

    if (isDeveloper) {
      query.join({
        type: 'left',
        field_relation: {
          to: { entity: 'device_contacts', field: 'device_id' },
          from: { entity: baseEntity, field: 'id' },
        },
      });
    }

    addCommonGridJoins(query, baseEntity);

    if (input.grouping?.length) {
      query.groupBy({
        query: {
          fields: input.grouping,
          has_count: true,
        },
      });
    }

    const { total_count: totalCount = 1, data: items } = await query.execute();
    const totalPages = Math.ceil(totalCount / (limit || 100));

    if (input.grouping?.length) {
      // Saved tabs may carry stale field strings ('device_services_protocol',
      // bare 'protocol'), so match loosely instead of exact-equality
      const groupedItems = input.grouping.some((g) =>
        String(g).endsWith('protocol'),
      )
        ? mergeUiProtocolGroups(items)
        : items;
      return { totalCount, items: groupedItems, currentPage: 0, totalPages };
    }

    // WP-843: resolve live online status in a SEPARATE query rather than by
    // joining device_online_statuses into the grid query above.
    //
    // This is deliberate. An entity the Store does not accept fails silently
    // (HTTP 200, error: null, empty result — measured on WP-838), and if that
    // happened to a join inside the main query it could empty the entire device
    // grid. Asking separately means the device list is fetched by a query that
    // never mentions the view, so the worst case is that this lookup returns
    // nothing and every row falls back to its stored flag — today's behaviour.
    const liveOnlineByDeviceId = await fetchLiveOnlineStatuses(
      ctx.dnaClient,
      ctx.token.value,
      (items ?? [])
        .map((item: Record<string, any>) => item?.[pluralEntity]?.id ?? item?.id)
        .filter(Boolean),
    );

    const protocolToType = (p?: string) =>
      p === 'ssh'
        ? 'ssh'
        : p === 'tty'
          ? 'tty'
          : p === 'http' || p === 'https'
            ? 'ui'
            : p === 'rd'
              ? 'rd'
              : null;

    const formatted_items = items?.map((item: Record<string, any>) => {
      let {
        [pluralEntity]: entity_data,
        device_services_protocols,
        device_services_statuses,
        created_by,
        updated_by,
        ...rest
      } = item;

      if (Array.isArray(created_by)) created_by = created_by?.[0];
      if (Array.isArray(updated_by)) updated_by = updated_by?.[0];

      const protocols: string[] = device_services_protocols ?? [];
      const statuses: string[] = device_services_statuses ?? [];
      const activeProtocols = protocols.filter(
        (_: string, i: number) => statuses[i] === 'Active',
      );
      const mappedTypes = activeProtocols
        .map((p: string) => protocolToType(p))
        .filter((t: string | null) => t !== null);
      const connection_types = [...new Set(mappedTypes)];

      return {
        ...entity_data,
        ...rest,
        connection_types,
        // WP-843: the row shape is unchanged (is_device_online stays a
        // top-level boolean); only where the value comes from has changed.
        is_device_online: resolveDeviceOnline(
          { ...entity_data, ...rest },
          liveOnlineByDeviceId,
        ),
        created_by: created_by?.full_name ?? '',
        updated_by: updated_by?.full_name ?? '',
      };
    });

    return {
      totalCount,
      items: formatted_items,
      currentPage: current,
      totalPages,
    };
    }),
});

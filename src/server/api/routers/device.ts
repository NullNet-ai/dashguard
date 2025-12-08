import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import Bluebird from 'bluebird'

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
        is_monitoring_enabled: z.boolean().optional(),
        is_remote_access_enabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, is_monitoring_enabled, is_remote_access_enabled } = input;

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
});

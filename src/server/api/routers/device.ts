import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator } from '@dna-platform/common-orm';
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
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot, {
          previously_logged_in_token : ctx.token.value,
        })
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
      console.info("🔍 ~ mutation() callback ~ src/server/api/routers/device.ts:132 ~ deviceRecord:", deviceRecord)
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
      console.info("🔍 ~ mutation() callback ~ src/server/api/routers/device.ts:170 ~ accountOrganizationRecord:", accountOrganizationRecord)
      const accountRecord = accountOrganization?.data?.[0]?.accounts;
      console.info("🔍 ~ mutation() callback ~ src/server/api/routers/device.ts:172 ~ accountRecord:", accountRecord)
      
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

        console.info("UPDATED RECORDS", {
          device, account, accountOrg
        })
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
});

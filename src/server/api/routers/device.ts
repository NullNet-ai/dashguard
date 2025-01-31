import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import ZodItems from "~/server/zodSchema/grid/items";
import {
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { formatSorting } from "~/server/utils/formatSorting";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { DeviceBasicDetailsSchema } from "~/server/zodSchema/device/deviceBasicDetails";
import { CredentialsGenerator } from "~/server/utils/credentials";
import argon2 from "argon2";
import { pluralize } from "~/server/utils/pluralize";
import { transformResMessage } from "~/server/utils/transformResponseMessage";

const entity = "device";

export const deviceRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateBasicDetails: privateProcedure
    .input(
      DeviceBasicDetailsSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, grouping, model, country, city, state, ...rest } = input;

      const modifyDeviceAddress = async () => {
        const find_res = await ctx.dnaClient
          .findOne(id!, {
            entity,
            token: ctx.token.value,
            query: {
              pluck: ["address_id"],
            },
          })
          .execute();

        const { address_id } = find_res?.data[0] || {};

        let address_res;

        if (address_id) {
          address_res = await ctx.dnaClient
            .update(address_id, {
              entity: "addresses",
              token: ctx.token.value,
              mutation: {
                params: {
                  country,
                  city,
                  state,
                },
              },
            })
            .execute();
        } else {
          address_res = await ctx.dnaClient
            .create({
              entity: "addresses",
              token: ctx.token.value,
              mutation: {
                params: {
                  country,
                  city,
                  state,
                  entity_prefix: "AD",
                },
              },
            })
            .execute();
        }

        return address_res?.data?.[0]?.id || address_id;
      };

      const address_id = await modifyDeviceAddress();

      //filter all device_groups with device_id
      //update to new grouoping id
      const modifyDeviceGroup = async () => {
        const filter_device_group = await ctx.dnaClient
          .findAll({
            entity: "device_groups",
            token: ctx.token.value,
            query: {
              pluck: ["id", "status"],
              advance_filters: createAdvancedFilter({ device_id: id }),
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute();

        if (filter_device_group.data.length) {
          const { id: existing_id } = filter_device_group?.data[0] || {};
          await ctx.dnaClient
            .update(existing_id, {
              entity: "device_groups",
              token: ctx.token.value,
              mutation: {
                params: {
                  device_id: id,
                  device_group_setting_id: grouping || null,
                  status: "Active",
                },
              },
            })
            .execute();
        } else {
          await ctx.dnaClient
            .create({
              entity: "device_groups",
              token: ctx.token.value,
              mutation: {
                params: {
                  device_id: id,
                  device_group_setting_id: grouping,
                  status: "Active",
                  entity_prefix: "DG",
                },
              },
            })
            .execute();
        }
      };

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
      ]);

      return {
        ...res?.[0],
        data: res,
      };
    }),
  mainGrid: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],

        pluck_object: _pluck_object,
      } = input;

      const pluck_object = {
        contacts: ["first_name", "last_name", "id"],
        organization_accounts: ["contact_id", "id", "device_id"],
        devices: [
          "id",
          "created_by",
          "updated_by",
          "created_date",
          "updated_date",
          "code",
          "status",
          "instance_name",
          "model",
        ],
        updated_by: ["first_name", "last_name", "id"],
        device_groups: ["device_group_setting_id", "device_id", "id"],
        device_group_settings: ["name", "id"],
        device_created_by: ["id", "instance_name"],
        device_updated_by: ["id", "instance_name"],
      };

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
                : (input.current || 1) * (input.limit || 100) -
                  (input.limit || 100),
            limit: input.limit || 1,
            by_field: "code",
            by_direction: EOrderDirection.DESC,
          },
          multiple_sort: input.sorting?.length
            ? formatSorting(input.sorting)
            : [],
        },
      });

      if (pluck_object) {
        query
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "created_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "contacts",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "contact_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "organization_account_updated_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "contacts",
                alias: "updated_by",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "contact_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "device_organization_account_created_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "devices",
                alias: "device_created_by",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "device_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "device_organization_account_updated_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "devices",
                alias: "device_updated_by",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "device_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "device_groups",
                field: "device_id",
              },
              from: {
                entity: input?.entity,
                field: "id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "device_group_settings",
                field: "id",
              },
              from: {
                entity: "device_groups",
                field: "device_group_setting_id",
              },
            },
          });
      }
      const { total_count: totalCount = 1, data: items } =
        await query.execute();

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          updated_by,
          contacts,
          device_group_settings,
          ...rest
        } = item;

        return {
          ...entity_data,
          ...rest,
          hierarchy: device_group_settings
            ?.map((setting: { name: string }) => setting.name)
            .join(", "),
          created_by: contacts?.length
            ? `${contacts?.[0].first_name} ${contacts?.[0].last_name}`
            : null,
          updated_by: updated_by?.length
            ? `${updated_by?.[0].first_name} ${updated_by?.[0].last_name}`
            : null,
        };
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);
      return {
        totalCount, // Total number of users
        items: formatted_items, // Paginated users
        currentPage: current, // The current page
        totalPages, // Total number of pages
      };
    }),

  fetchBasicDetails: privateProcedure
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
              pluck: ["id"],
              advance_filters: createAdvancedFilter({ code: code! }),
              order: {
                limit: 1,
                by_field: "created_date",
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
              pluck_object: {
                devices: [
                  "id",
                  "model",
                  "instance_name",
                  "address_id",
                  "created_date",
                  "updated_date",
                  "categories"
                ],
                addresses: ["id", "country", "city", "state"],
              },
              advance_filters: createAdvancedFilter({ id: id! }),
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "addresses",
                field: "id",
              },
              from: {
                entity,
                field: "address_id",
              },
            },
          })
          .execute(),
        await ctx.dnaClient
          .findAll({
            entity: "device_groups",
            token: ctx.token.value,
            query: {
              pluck_object: {
                device_group_settings: ["id", "name"],
                device_groups: ["id", "device_group_setting_id"],
              },
              advance_filters: createAdvancedFilter({ device_id: id! }),
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "device_group_settings",
                field: "id",
              },
              from: {
                entity: "device_groups",
                field: "device_group_setting_id",
              },
            },
          })
          .execute(),
      ]);

      // return res;
      const [devices, device_group] = res;

      const { id: device_group_setting_id, name } =
        device_group.data[0]?.device_group_settings?.[0] || {};
      const { addresses, ...rest } = devices?.data?.[0] || {};
      const { id: add_id, ...rest_address } = addresses?.[0] || {};

      return {
        data: {
          ...rest,
          ...rest_address,
          grouping: device_group_setting_id,
          grouping_name: name,
        },
      };
    }),

  createOrganizationAccount: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const advance_filters = createAdvancedFilter({ device_id: id });
      const find_res = await ctx.dnaClient
        .findAll({
          entity: "organization_account",
          token: ctx.token.value,
          query: {
            pluck: ["id", "account_id", "device_id"],
            advance_filters,
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (!find_res.data[0]) {
        const { organization_id } = ctx.session.account;

        const account_id = CredentialsGenerator.generateAppId();
        const account_secret = CredentialsGenerator.generateAppSecret();

        const hashed_account_secret = await argon2.hash(account_secret);

        const reg_res = await ctx.dnaClient
          .create({
            entity: "organization_account",
            token: ctx.token.value,
            mutation: {
              params: {
                account_id,
                account_secret: hashed_account_secret,
                organization_id,
                entity_prefix: "OA",
                categories: ["Device"],
                device_id: id,
              },
              pluck: ["id", "account_id"],
            },
          })
          .execute();

        if (!reg_res.success) {
          throw new Error(`Failed to create an account for device ${id}`);
        }

        return {
          account_id,
          account_secret,
          message: transformResMessage(reg_res?.message),
        };
      }

      return {
        account_id: find_res.data[0].account_id,
        message: transformResMessage(find_res?.message),
      };
    }),

  updateDeviceSetup: privateProcedure
    .input(
      z.object({
        id: z.string(),
        instance_name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, instance_name } = input;

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              instance_name,
            },
            pluck: ["id", "instance_name"],
          },
        })
        .execute();

      return {
        ...res,
        data: res,
      };
    }),

  fetchOrganizationAccount: privateProcedure
    .input(
      z.object({
        code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input;

      const advance_filters = createAdvancedFilter({ code: code! });

      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              device: ["id"],
              organization_account: ["id", "account_id", "device_id"],
            },
            advance_filters,
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "organization_account",
              field: "device_id",
            },
            from: {
              entity,
              field: "id",
            },
          },
        })
        .execute();

      return {
        data: res.data[0],
      };
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
            pluck: ["id", "is_monitoring_enabled", "is_remote_access_enabled"],
          },
        })
        .execute();

      return {
        ...res,
        data: res,
      };
    }),
  fetchDeviceConnectionStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const find_res = await ctx.dnaClient
        .findOne(id!, {
          entity,
          token: ctx.token.value,
          query: {
            pluck: ["is_connection_established"],
          },
        })
        .execute();

      return {
        is_connection_established:
          !!find_res?.data?.[0]?.is_connection_established,
      };
    }),
  updateDeviceConnectionStatus: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              is_connection_established: true,
            },
            pluck: ["id", "is_connection_established"],
          },
        })
        .execute();

      return res;
    }),

  fetchSetupDetails: privateProcedure
    .input(
      z.object({
        code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { code } = input;

      const res = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            // pluck: ["id", "instance_name"],
            pluck_object: {
              device: ["id", "instance_name"],
              organization_account: ["id", "account_id", "account_name"],
            },
            advance_filters: createAdvancedFilter({ code: code! }),
            order: {
              limit: 1,
              by_field: "created_date",
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
        .execute();

      return {
        data: res.data[0],
      };
    }),

  updateOrganizationAccount: privateProcedure
    .input(
      z.object({
        id: z.string(),
        account_secret: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, account_secret } = input;
      const advance_filters = createAdvancedFilter({ device_id: id });
      const find_res = await ctx.dnaClient
        .findAll({
          entity: "organization_account",
          token: ctx.token.value,
          query: {
            pluck: ["id", "account_id", "device_id"],
            advance_filters,
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      const hashed_account_secret = await argon2.hash(account_secret);

      const response = await ctx.dnaClient
        .update(find_res?.data[0]?.id, {
          entity: "organization_account",
          token: ctx.token.value,
          mutation: {
            params: {
              account_secret: hashed_account_secret,
              device_id: id,
            },
            pluck: ["id", "account_id"],
          },
        })
        .execute();

      return {
        account_id: find_res?.data[0]?.account_id,
        message: transformResMessage(response?.message),
      };
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
      const { id, pluck_fields, main_entity: entity } = input;

      const pluck_object = {
        created_by_data: ["first_name", "last_name", "id"],
        updated_by_data: ["first_name", "last_name", "id"],
        organization_accounts: ["contact_id", "id", "device_id"],
        devices: [
          "id",
          "created_by",
          "updated_by",
          "created_date",
          "updated_date",
          "code",
          "status",
          "instance_name",
          "model",
        ],
        device_groups: ["device_group_setting_id", "device_id", "id"],
        device_group_settings: ["name", "id"],
        device_created_by: ["id", "instance_name"],
        device_updated_by: ["id", "instance_name"],
      };
      const _advance_filters = createAdvancedFilter({
        code: id,
      });

      const query = ctx.dnaClient.findAll({
        entity: entity,
        token: ctx.token.value,
        query: {
          pluck: pluck_fields,
          pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
        },
      });

      if (pluck_object) {
        query
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "created_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "contacts",
                alias: "created_by_data",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "contact_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "organization_account_updated_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "contacts",
                alias: "updated_by_data",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "contact_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "device_organization_account_created_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "devices",
                alias: "device_created_by",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "device_id",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organization_accounts",
                alias: "device_organization_account_updated_by",
                field: "id",
              },
              from: {
                entity: "devices",
                field: "updated_by",
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "devices",
                alias: "device_updated_by",
                field: "id",
              },
              from: {
                entity: "organization_accounts",
                field: "device_id",
              },
            },
          });
      }
      const response = await query.execute();

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
      };
    }),
});

import { z } from 'zod';
import {
  createTRPCRouter,
  privateProcedure,
  // privateProcedure
} from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import {
  addCommonGridConcatenates,
  addCommonGridJoins,
  addCommonGridPluckObject,
} from '~/server/utils/queryBuilder';
import pluralize from 'pluralize';
import {
  EOperator,
  EOrderDirection,
  IAdvanceFilters,
  IGroupAdvanceFilters,
} from '@dna-platform/common-orm';
import { formatSorting } from '~/server/utils/formatSorting';
import ZodSearchSuggestions from '~/server/zodSchema/grid/searchSuggestions';
import { searchSuggestionTransformer } from '~/components/platform/Grid/Search/utils/searchSuggestionTransformer';
import { formatPhoneNumber } from '~/utils/formatter';
import { capitalize } from 'lodash';
const protocolValueToLabel = {
  'inet/any': 'IPv4/*',
  'inet/tcp': 'IPv4/TCP',
  'inet/tcp/udp': 'IPv4/TCP/UDP',
  'inet6/any': 'IPv6/*',
  'inet6/tcp': 'IPv6/TCP',
  'inet6/tcp/udp': 'IPv6/TCP/UDP',
  'inet46/any': 'IPv4+6/*',
  'inet46/tcp': 'IPv4+6/TCP',
  'inet46/tcp/udp': 'IPv4+6/TCP/UDP',
} as const;
const protocolLabelToValue = Object.entries(protocolValueToLabel).reduce(
  (acc, [value, label]) => {
    acc[label.toLowerCase()] = value;
    return acc;
  },
  {} as Record<string, string>,
);
const resolveProtocolFilterValue = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const key = value.trim().toLowerCase();
  if (!key) return value;

  const exact = protocolLabelToValue[key];
  if (exact) return exact;

  if (key.includes('ipv4+6') || key.includes('ipv4+ipv6') || key.includes('ipv46')) {
    return 'inet46';
  }
  if (key.includes('ipv6')) return 'inet6';
  if (key.includes('ipv4')) return 'inet';

  return value;
};
const resolveProtocolDisplayValue = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const key = value.trim().toLowerCase();
  if (!key) return value;
  const exact = (protocolValueToLabel as Record<string, string>)[key];
  if (exact) return exact;
  if (key === 'inet46') return 'IPv4+6';
  if (key === 'inet6') return 'IPv6';
  if (key === 'inet') return 'IPv4';
  return value;
};

const buildDeviceRemoteAccessSessionSuggestions = async ({
  ctx,
  input,
  baseEntity,
}: {
  ctx: any;
  input: z.infer<typeof ZodSearchSuggestions>;
  baseEntity: 'device_tunnels' | 'device_ssh_sessions' | 'device_tty_sessions';
}) => {
  const tunnelEntity = 'device_tunnels';
  let {
    advance_filters: _advance_filters = [],
    sorting,
    group_advance_filters: _group_advance_filters = [],
    searchable_fields = [],
  } = input;

  const pluck_object: Record<string, any> = {
    ...addCommonGridPluckObject(),
    devices: ['device_name', 'id'],
    device_services: ['address', 'port'],
    [baseEntity]: input.pluck,
  };

  const query = ctx.dnaClient.searchSuggestions({
    entity: baseEntity,
    token: ctx.token.value,
    query: {
      pluck: input.pluck,
      track_total_records: true,
      pluck_object,
      advance_filters: [...(_advance_filters as IAdvanceFilters[])],
      group_advance_filters: _group_advance_filters as IGroupAdvanceFilters<string | number>[],
      order: {
        starts_at:
          (input.current || 0) === 0
            ? 0
            : (input.current || 1) * (input.limit || 100) - (input.limit || 100),
        limit: input.limit || 1,
        by_field: input?.sorting?.length === 1 ? input.sorting[0]?.id : 'code',
        by_direction:
          input?.sorting?.length === 1
            ? input.sorting[0]?.desc
              ? EOrderDirection.DESC
              : EOrderDirection.ASC
            : EOrderDirection.DESC,
      },
      multiple_sort:
        sorting?.length && sorting?.length > 1
          // @ts-expect-error - No type yet
          ? formatSorting(sorting)
          : [],
      concatenate_fields: [...addCommonGridConcatenates(baseEntity)],
    },
  });

  if (baseEntity === tunnelEntity) {
    query
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'devices',
            field: 'id',
          },
          from: {
            entity: tunnelEntity,
            field: 'device_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'device_services',
            field: 'id',
          },
          from: {
            entity: tunnelEntity,
            field: 'service_id',
          },
        },
      })
      ;
  }

  if (baseEntity === 'device_ssh_sessions' || baseEntity === 'device_tty_sessions') {
    query
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'devices',
            field: 'id',
          },
          from: {
            entity: baseEntity,
            field: 'device_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: tunnelEntity,
            field: 'id',
          },
          from: {
            entity: baseEntity,
            field: 'device_tunnel_id',
          },
        },
      })
      .nestedJoin({
        type: 'left',
        field_relation: {
          to: {
            entity: 'device_services',
            field: 'id',
          },
          from: {
            entity: tunnelEntity,
            field: 'service_id',
          },
        },
      });
  }

  addCommonGridJoins(query, baseEntity);

  const { data: items } = await query.execute();
  let suggestions = searchSuggestionTransformer(items, searchable_fields);
  suggestions = suggestions.map((e) => {
        let updatedSuggestion = e
        if (e.field === 'tunnel_type') {
          updatedSuggestion = {
            ...e,
            display_value: e.values?.[0].toUpperCase(),
          }
        } else if (e.field === 'tunnel_status') {
          updatedSuggestion = {
            ...e,
            display_value: capitalize(e.values?.[0]),
          }
        }
        return updatedSuggestion
      });
  return { items: suggestions };
};
const entity = '';
export const searchRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  searchSuggestions: privateProcedure
    // Define input using zod for validation
    .input(ZodSearchSuggestions)
    .mutation(async ({ input, ctx }) => {
      let {
        advance_filters: _advance_filters = [],
        entity,
        sorting,
        group_advance_filters: _group_advance_filters = [],
        searchable_fields = [],
      } = input;

      const pluck_object = {
        ...addCommonGridPluckObject(),
        [pluralize(entity)]: input.pluck,
      };
      if (entity === 'device_filter_rules' || entity === 'device_nat_rules') {
        _advance_filters = _advance_filters.map(e => {
          let updatedFilter = e
          if (e.field === 'order' || e.field === 'disabled') {
            updatedFilter = {
              ...e,
              parse_as: 'text',
            }
          }
          if (e.field === 'protocol') {
            updatedFilter = {
              ...e,
              values: e.values?.map(resolveProtocolFilterValue)
            }
          }
          else if (e.field === 'disabled') {
            updatedFilter = {
              ...updatedFilter,
              values: updatedFilter.values?.map(v => {
                if ('enabled'.toLowerCase().includes(v.toLowerCase())) {
                  return 'false'
                } else if ('disabled'.toLowerCase().includes(v.toLowerCase())) {
                  return 'true'
                }
                return v
              }),
            }
          }
          return updatedFilter
        })
      } else if (entity === 'device') {
        _advance_filters = _advance_filters.map(e => {
          let updatedFilter = e
          if (e.field === 'is_device_authorized' || e.field === 'is_device_online') {
            updatedFilter = {
              ...e,
              parse_as: 'text',
            }
          }
          if (e.field === 'is_device_authorized') {
            updatedFilter = {
              ...updatedFilter,
              values: updatedFilter.values?.map(v => {
                if ('authorized'.toLowerCase().includes(v.toLowerCase())) {
                  return true
                } else if ('unauthorized'.toLowerCase().includes(v.toLowerCase())) {
                  return false
                }
                return v
              }),
            }
          }
          else if (e.field === 'is_device_online') {
            updatedFilter = {
              ...updatedFilter,
              values: updatedFilter.values?.map(v => {
                if ('online'.toLowerCase().includes(v.toLowerCase())) {
                  return true
                } else if ('offline'.toLowerCase().includes(v.toLowerCase())) {
                  return false
                }
                return v
              }),
            }
          }
          return updatedFilter
        })
      }

      const query = ctx.dnaClient.searchSuggestions({
        entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          track_total_records: true,
          pluck_object: pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
          group_advance_filters: _group_advance_filters as IGroupAdvanceFilters<
            string | number
          >[],
          order: {
            starts_at:
              // current 5 *  input.limit 50 = 250
              (input.current || 0) === 0
                ? 0
                : (input.current || 1) * (input.limit || 100) -
                  (input.limit || 100),
            limit: input.limit || 1,
            by_field:
              input?.sorting?.length === 1 ? input.sorting[0]?.id : 'code',
            by_direction:
              input?.sorting?.length === 1
                ? input.sorting[0]?.desc
                  ? EOrderDirection.DESC
                  : EOrderDirection.ASC
                : EOrderDirection.DESC,
          },
          multiple_sort:
            sorting?.length && sorting?.length > 1
              // @ts-expect-error - No type yet
              ? formatSorting(sorting)
              : [],
          concatenate_fields: [...addCommonGridConcatenates(input?.entity)],
        },
      });
      addCommonGridJoins(query, entity);

      const { data: items } = await query.execute();
      
      console.log("$$$ ~ items:", items)

      // Calculate total number of pages
      let suggestions = searchSuggestionTransformer(items, searchable_fields)
      // @ts-expect-error - No type yet
      suggestions = suggestions.map((e) => {
        let updatedSuggestion = e
        if (e.field === 'is_device_authorized') {
          updatedSuggestion = {
            ...e,
            display_value: e.values?.[0] === 'true' ? 'Authorized' : 'Unauthorized'
          }
        } else if (e.field === 'is_device_online') {
          updatedSuggestion = {
            ...e,
            display_value: e.values?.[0] === 'true' ? 'Online' : 'Offline'
          }
        } else if (e.field === 'protocol') {
          const displayValue = Array.isArray(e.values)
            ? e.values.map(resolveProtocolDisplayValue).join(', ')
            : e.display_value
          updatedSuggestion = {
            ...e,
            display_value: displayValue,
          }
        } else if (e.field === 'disabled') {
          updatedSuggestion = {
            ...e,
            display_value: e.values?.[0] === 'true' ? 'Disabled' : 'Enabled'
          }
        }
        return updatedSuggestion
      });
      
      return { items: suggestions };
    }),
  aliasSearch: privateProcedure
    .input(
      ZodSearchSuggestions.extend({
        device_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        advance_filters: _advance_filters = [],
        entity,
        sorting,
        group_advance_filters: _group_advance_filters = [],
        searchable_fields = [],
        device_id,
      } = input;

      const pluck_object = {
        ...addCommonGridPluckObject(),
        aliases: input.pluck,
        ip_aliases: ['ip'],
      };

      const device_configuration = await ctx.dnaClient.findAll({
        entity: 'device_configurations',
        token: ctx.token.value,
        query: {
          pluck: ['id', 'created_date', 'timestamp'],
          advance_filters: [
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'device_configurations',
              operator: EOperator.EQUAL,
              values: [device_id],
            },
          ],
          order: {
            limit: 1,
            by_field: 'timestamp',
            by_direction: EOrderDirection.DESC,
            is_case_sensitive_sorting: true,
          },
          // multiple_sort: [
          //   {
          //     by_field: 'created_date',
          //     by_direction: EOrderDirection.DESC,
          //   },
          //   {
          //     by_field: 'created_time',
          //     by_direction: EOrderDirection.DESC,
          //   },
          // ],
        },

      }).execute()

      const device_conf_id = device_configuration?.data?.[0]?.id as string

      const query = ctx.dnaClient
        .searchSuggestions({
          entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            track_total_records: true,
            pluck_group_object: {
              ip_aliases: ['ip'],
            },
            pluck_object,
            advance_filters: [
              ..._advance_filters.map(e => {
                if (!e.entity) {
                  return {
                    ...e,
                    entity: 'aliases',
                  }
                }
                return e
              }),
              {
                operator: 'and',
                type: 'operator',
                default: true,
              },
              {
                type: 'criteria',
                field: 'device_configuration_id',
                entity: 'aliases',
                operator: EOperator.EQUAL,
                values: [device_conf_id],
              },
            ] as IAdvanceFilters[],
            group_advance_filters: _group_advance_filters as IGroupAdvanceFilters<
              string | number
            >[],
            order: {
              starts_at:
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
              by_field:
                input?.sorting?.length === 1 ? input.sorting[0]?.id : 'code',
              by_direction:
                input?.sorting?.length === 1
                  ? input.sorting[0]?.desc
                    ? EOrderDirection.DESC
                    : EOrderDirection.ASC
                  : EOrderDirection.DESC,
            },
            multiple_sort:
              sorting?.length && sorting?.length > 1
                // @ts-expect-error - No type yet
                ? formatSorting(sorting)
                : [],
            concatenate_fields: [...addCommonGridConcatenates(input?.entity)],
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'ip_aliases',
              field: 'alias_id',
            },
            from: {
              entity: 'aliases',
              field: 'id',
            },
          },
        });

      addCommonGridJoins(query, entity);

      const { data: items } = await query.execute();

      const suggestions = searchSuggestionTransformer(items, searchable_fields);

      return { items: suggestions };
    }),
  contactSearch: privateProcedure
    // Define input using zod for validation
    .input(ZodSearchSuggestions)
    .query(async ({ input, ctx }) => {
      const {
        advance_filters: _advance_filters = [],
        entity,
        group_advance_filters: _group_advance_filters = [],
        searchable_fields = [],
      } = input;

      const query = ctx.dnaClient
        .searchSuggestions({
          entity: input?.entity,
          token: ctx.token.value,
          query: {
            pluck_group_object: {
              contact_phone_numbers: ['raw_phone_number', 'is_primary'],
              contact_emails: ['email', 'is_primary'],
              organization_contacts: ['id', 'contact_organization_id'],
              organizations: ['id', 'name', 'categories'],
            },

            pluck_object: {
              ...addCommonGridPluckObject(),
              contact_emails: ['email', 'is_primary'],
              contact_phone_numbers: [
                'raw_phone_number',
                'iso_code',
                'country_code',
                'is_primary',
              ],
              contacts: [...input.pluck, 'previous_status'],
              organizations: ['id', 'name', 'categories'],
              organization_contacts: ['id', 'contact_organization_id'],
            },
            track_total_records: true,
            advance_filters: input?.advance_filters as IAdvanceFilters[],
            group_advance_filters: (input.group_advance_filters ||
              []) as IGroupAdvanceFilters<string | number>[],
            order: {
              starts_at:
                // current 5 *  input.limit 50 = 250
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
              // by_field: "created_date",
              // by_direction: EOrderDirection.ASC,
            },
            multiple_sort: input.sorting?.length
              // @ts-expect-error - No type yet
              ? formatSorting(input.sorting)
              : [],
            concatenate_fields: [...addCommonGridConcatenates(input?.entity)],
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_email',
              field: 'contact_id',
            },
            from: {
              entity,
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_phone_number',
              field: 'contact_id',
            },
            from: {
              entity,
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_contacts',
              field: 'contact_id',
            },
            from: {
              entity,
              field: 'id',
            },
          },
        })
        .nestedJoin({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organizations',
              field: 'id',
            },
            from: {
              entity: 'organization_contacts',
              field: 'contact_organization_id',
            },
          },
        });
      addCommonGridJoins(query, entity);

      const { data: items } = await query.execute();

      // Calculate total number of pages
      const suggestions = searchSuggestionTransformer(items, searchable_fields);
      const resolvedSuggestions = suggestions.map((suggestion: any) => {
        const iso_code = suggestion?.iso_code ?? 'us';
        const primary_phone_number = formatPhoneNumber({
          raw_phone_number: suggestion.display_value as string,
          iso_code,
        });
        if (suggestion.field === 'raw_phone_number') {
          return {
            ...suggestion,
            display_value: primary_phone_number,
          };
        }
        return suggestion;
      });
      return { items: resolvedSuggestions };
    }),
  accountSearch: privateProcedure
    // Define input using zod for validation
    .input(ZodSearchSuggestions)
    .query(async ({ input, ctx }) => {
      const {
        advance_filters: _advance_filters = [],
        entity,
        sorting,
        group_advance_filters: _group_advance_filters = [],
        searchable_fields = [],
      } = input;

      const pluck_object = {
        ...addCommonGridPluckObject(),
        [pluralize(entity)]: input.pluck,
      };

      const query = ctx.dnaClient
        .searchSuggestions({
          entity: input?.entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              ...addCommonGridPluckObject(),
              account_organizations: [
                'id',
                'email',
                'status',
                'code',
                'categories',
                'account_organization_status',
                'created_date',
                'created_time',
                'updated_date',
                'updated_time',
                'created_by',
                'updated_by',
                'contact_id',
              ],
              contacts: ['id', 'first_name', 'last_name'],
            },
            track_total_records: true,
            advance_filters: input.advance_filters as IAdvanceFilters[],
            order: {
              starts_at:
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
            },
            multiple_sort: input.sorting?.length
              // @ts-expect-error - No type yet
              ? formatSorting(input.sorting)
              : [],
            concatenate_fields: [
              {
                fields: ['first_name', 'last_name'],
                field_name: 'full_name',
                separator: ' ',
                entity: 'contacts',
                aliased_entity: 'created_by',
              },
              {
                fields: ['first_name', 'last_name'],
                field_name: 'full_name',
                separator: ' ',
                entity: 'contacts',
                aliased_entity: 'updated_by',
              },
            ],
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
              entity: 'account_organizations',
              field: 'contact_id',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'account_organizations',
              field: 'id',
            },
            from: {
              alias: 'created_by_account_organizations',
              entity: 'account_organizations',
              field: 'created_by',
            },
          },
        })
        .nestedJoin({
          type: 'left',
          field_relation: {
            to: {
              alias: 'created_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'account_organizations',
              field: 'contact_id',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'account_organizations',
              field: 'id',
            },
            from: {
              alias: 'updated_by_account_organizations',
              entity: 'account_organizations',
              field: 'updated_by',
            },
          },
        })
        .nestedJoin({
          type: 'left',
          field_relation: {
            to: {
              alias: 'updated_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'account_organizations',
              field: 'contact_id',
            },
          },
        });

      const { data: items } = await query.execute();

      // Calculate total number of pages
      const suggestions = searchSuggestionTransformer(items, searchable_fields);
      return { items: suggestions };
    }),
  // Project Level
  deviceRemoteAccessSessionSearch: privateProcedure
    .input(ZodSearchSuggestions)
    .mutation(async ({ input, ctx }) => {
      const resolvedEntity = (input?.entity ?? 'device_tunnels') as
        | 'device_tunnels'
        | 'device_ssh_sessions'
        | 'device_tty_sessions';

      if (
        resolvedEntity !== 'device_tunnels'
        && resolvedEntity !== 'device_ssh_sessions'
        && resolvedEntity !== 'device_tty_sessions'
      ) {
        return buildDeviceRemoteAccessSessionSuggestions({
          ctx,
          input,
          baseEntity: 'device_tunnels',
        });
      }

      return buildDeviceRemoteAccessSessionSuggestions({
        ctx,
        input,
        baseEntity: resolvedEntity,
      });
    }),
  deviceRemoteAccessSessionUiSearch: privateProcedure
    .input(ZodSearchSuggestions)
    .mutation(async ({ input, ctx }) => {
      return buildDeviceRemoteAccessSessionSuggestions({
        ctx,
        input: {
          ...input,
          entity: 'device_tunnels',
        },
        baseEntity: 'device_tunnels',
      });
    }),
  deviceRemoteAccessSessionSshSearch: privateProcedure
    .input(ZodSearchSuggestions)
    .mutation(async ({ input, ctx }) => {
      return buildDeviceRemoteAccessSessionSuggestions({
        ctx,
        input: {
          ...input,
          entity: 'device_ssh_sessions',
        },
        baseEntity: 'device_ssh_sessions',
      });
    }),
  deviceRemoteAccessSessionTtySearch: privateProcedure
    .input(ZodSearchSuggestions)
    .mutation(async ({ input, ctx }) => {
      return buildDeviceRemoteAccessSessionSuggestions({
        ctx,
        input: {
          ...input,
          entity: 'device_tty_sessions',
        },
        baseEntity: 'device_tty_sessions',
      });
    }),
});

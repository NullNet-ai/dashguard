// import z from "zod";
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
  EOrderDirection,
  IAdvanceFilters,
  IGroupAdvanceFilters,
} from '@dna-platform/common-orm';
import { formatSorting } from '~/server/utils/formatSorting';
import ZodSearchSuggestions from '~/server/zodSchema/grid/searchSuggestions';
import { searchSuggestionTransformer } from '~/components/platform/Grid/Search/utils/searchSuggestionTransformer';
import { formatPhoneNumber } from '~/utils/formatter';
const entity = '';
export const searchRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  searchSuggestions: privateProcedure
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
              ? formatSorting(sorting)
              : [],
          concatenate_fields: [...addCommonGridConcatenates(input?.entity)],
        },
      });
      addCommonGridJoins(query, entity);

      const { data: items } = await query.execute();

      // Calculate total number of pages
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
});

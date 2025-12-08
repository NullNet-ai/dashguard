// import z from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  // privateProcedure
} from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import pluralize, { singular } from 'pluralize';
import {
  EDateFormats,
  EOperator,
  EOrderDirection,
  IAdvanceFilters,
} from '@dna-platform/common-orm';

const filterItems = (items: any[]) => {
  return items.filter((item) => {
    if (!item.new_value || typeof item.new_value !== 'object') return false;

    const keys = Object.keys(item.new_value);
    const keyCount = keys.length;

    // Remove empty objects
    if (keyCount === 0) return false;
      //custom filter for organization_contacts
    if (
      item.table === 'organization_contacts' &&
      item?.new_value?.status === 'Archived'
    ) {
      return false;
    }
       // Remove if: length 1-4 AND all keys are in target keys
    if (keyCount >= 1 && keyCount <= 4) {
      const allKeysAreTargets = keys.every((key) => targetKeys.includes(key));
      return !allKeysAreTargets; // Return false to remove, true to keep
    }


  
    
 
    return true; // Keep everything else
  });
};

const processDataByFirstDot = (data: string[]): string[] => {
  if (!data || data.length === 0) {
    return [];
  }
  return data
    .filter((item) => {
      // Count the number of dots in the string
      const dotCount = (item.match(/\./g) || []).length;
      // Only keep strings with exactly one dot
      return dotCount === 1;
    })
    .map((item) => {
      const firstDotIndex = item.indexOf('.');
      const fieldPath = item.substring(firstDotIndex + 1);

      return fieldPath;
    });
};

import { z } from 'zod';
import ZodSearchSuggestions from '~/server/zodSchema/grid/searchSuggestions';
import { searchSuggestionTransformerTimeline } from '~/components/platform/Grid/Search/utils/searchSuggestionTransformer';
import Bluebird from 'bluebird';

const enumParentEntities = ['organizations', 'contacts'];
const targetKeys = ['version', 'updated_time', 'updated_date', 'updated_by', 'previous_status'];

const ENTITY = 'timeline';
export const timelineRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  timelineData: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()),
        advanceFilter: z.array(z.any()).optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const _adv_filter = input?.advanceFilter?.map((filter) => ({
        operator: filter.operator,
        type: filter.type,
        field: filter.field,
        label: filter.label,
        values: filter.values,
        is_case_sensitive_sorting: false,
      }));

      const result_for_total = await ctx.dnaClient
        .filterTimelineRecords({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters:
              _adv_filter || ([] as IAdvanceFilters<string | number>[]),
            group_advance_filters: [],
            order: {
              starts_at: 0,
              is_case_sensitive_sorting: true,
              by_direction: EOrderDirection.DESC,
              by_field: 'timestamp',
              limit: -1,
            },
          },
        })
        .execute();

      const limit = input?.limit || 100;

      const results = await ctx.dnaClient
        .filterTimelineRecords({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters:
              _adv_filter || ([] as IAdvanceFilters<string | number>[]),
            group_advance_filters: [],
            order: {
              starts_at: 0,
              is_case_sensitive_sorting: true,
              by_direction: EOrderDirection.DESC,
              by_field: 'timestamp',
              limit: limit,
            },
            multiple_sort: [
              // { by_direction: 'desc', by_field: 'created_date' },
              // {
              //   by_direction: 'desc',
              //   by_field: 'created_time',
              //   is_case_sensitive_sorting: false,
              // },
            ],
          },
        })
        .execute();

      const { data: total_data } = result_for_total;
      const { data: timeline_data, count, record_count } = results;

      // filter data and remove items that have new_value with only 2 or 3 keys
      const filtered_data = filterItems(timeline_data);
      const filter_count = filterItems(total_data);

      const response = await Bluebird.map(filtered_data, async (item) => {
        // if (item.event_name !== 'timeline_organization_contacts') {
        //   return item;
        // }

        const { table, record_id, reference_id } = item;
        let parent_code_new = null;

        if (reference_id) {
          const parent_result = await ctx.dnaClient
            .filterTimelineRecords({
              entity: ENTITY,
              token: ctx.token.value,
              query: {
                pluck: input.pluck,
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'reference_id',
                    operator: EOperator.EQUAL,
                    values: [reference_id],
                  },
                  {
                    operator: 'and',
                    type: 'operator',
                  },
                  {
                    type: 'criteria',
                    field: 'record_code',
                    operator: EOperator.NOT_CONTAINS,
                    values: ['CTR'],
                  },
                  {
                    operator: 'and',
                    type: 'operator',
                  },
                  ...(input.advanceFilter || []),
                ] as IAdvanceFilters<string | number>[],
                group_advance_filters: [],
                order: {
                  limit: 100,
                  starts_at: 0,
                  is_case_sensitive_sorting: true,
                  by_direction: EOrderDirection.DESC,
                  by_field: 'timestamp',
                },
                multiple_sort: [
                  // { by_direction: 'desc', by_field: 'created_date' },
                  // {
                  //   by_direction: 'desc',
                  //   by_field: 'created_time',
                  //   is_case_sensitive_sorting: false,
                  // },
                ],
              },
            })
            .execute();

          if (parent_result?.data?.length) {
            parent_code_new = parent_result?.data?.[0]?.record_code || '';
          }
        }

        const variables = (await ctx.redisClient.getHashValue(
          `schema:${pluralize(table)}`,
          'formatted_with_related_fields',
        )) as any;

        if (!variables) {
          console.error('No variables found for table', table);
          return { ...item, parent_code_new: parent_code_new };
        }

        const plucks = processDataByFirstDot(variables);

        const splitTable = table.split('_');
        // Processing table and item data

        const parentEntity = pluralize(splitTable[0]);

        if (
          enumParentEntities.includes(parentEntity) ||
          table === 'grid_filters'
        ) {
          const isAlreadyParent = splitTable?.length <= 1;

          const query = ctx.dnaClient.findAll({
            entity: table,
            token: ctx.token.value,
            query: {
              pluck: plucks,
              advance_filters: [
                {
                  type: 'criteria',
                  field: 'id',
                  operator: EOperator.EQUAL,
                  values: [record_id],
                },
              ],
              order: {
                limit: 100,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          });

          const result = await query.execute();
          // Query execution completed

          if (!isAlreadyParent && table !== 'grid_filters') {
            // Flatten the array of arrays into a single array of objects with key and value properties
            const getKeyIDs = result.data.flatMap((item) =>
              Object.keys(item)
                .filter((key) => key.endsWith('_id'))
                .map((key) => ({
                  key,
                  value: item[key],
                })),
            );

            const responseData = await Bluebird.map(getKeyIDs, async (item) => {
              const { key, value } = item;

              let parentTable = key.split('_')?.[0] ?? '';
              if (!parentTable) {
                return {
                  ...item,
                  parent_details: {},
                  parent_code_new: parent_code_new,
                };
              }

              if (key === 'contact_organization_id') {
                parentTable = 'organization';
              }

              const variables = (await ctx.redisClient.getHashValue(
                `schema:${pluralize(parentTable)}`,
                'formatted_with_related_fields',
              )) as any;
              const plucks = processDataByFirstDot(variables);

              const record = await ctx.dnaClient
                .findOne(value, {
                  entity: singular(parentTable),
                  token: ctx.token.value,
                  query: {
                    pluck: plucks,
                  },
                })
                .execute();

              return {
                [parentTable]: record.data?.[0],
              };
            });

            return {
              ...item,
              parent_code_new: parent_code_new,
              parent_details: responseData?.length
                ? responseData.reduce(
                    (acc, curr) => ({ ...acc, ...curr }),
                    {} as Record<string, any>,
                  )
                : {},
            };
          } else if (table === 'grid_filters') {
            return {
              ...item,
              parent_details: result?.data?.[0],
              parent_code_new: parent_code_new,
            };
          }

          return {
            ...item,
            parent_details: {},
            parent_code_new: parent_code_new,
          };
        }
        return { ...item, parent_code_new: parent_code_new };
      }).filter(Boolean);

      return {
        data: response,
        count: count,
        all_record_counts: filter_count?.length || 0,
        totalCount: count,
      };
    }),

  timelineSearch: privateProcedure
    .input(ZodSearchSuggestions)
    .query(async ({ ctx, input }) => {
      const {
        advance_filters: _advance_filters = [],
        pluck,
        entity,
        group_advance_filters: _group_advance_filters = [],
        searchable_fields = [],
      } = input;

      const newAdvFilter = _advance_filters.map(({ entity, ...rest }) => ({
        ...rest,
        is_case_sensitive_sorting: false,
      }));

      const news = newAdvFilter.map((item) => {
        if (item.type === 'operator') {
          return {
            operator: item.operator,
            type: item.type,
          };
        }
      });

      const { data: items } = await ctx.dnaClient
        .timelineSearchSuggestions({
          entity: 'timeline_data',
          // mutation: {
          //   params: {
          //     first_name: 'Jean3',
          //   },
          // },
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'action',
              'record_created_date',
              'new_value',
              'responsible_account_full_name',
            ],
            advance_filters: newAdvFilter as IAdvanceFilters[],
            order: {
              limit: 100,
              starts_at: 0,
              is_case_sensitive_sorting: false,
            },
            multiple_sort: [
              {
                by_field: 'timestamp',
                by_direction: EOrderDirection.DESC,
                is_case_sensitive_sorting: true,
              },
            ],
            date_format: EDateFormats['mm/dd/YYYY'],
            group_advance_filters: [],
            distinct_by: '',
            timezone: 'Asia/Manila',
          },
        })
        .execute();

      const suggestions = searchSuggestionTransformerTimeline(
        items,
        searchable_fields,
      );
      const resolvedSuggestions = suggestions.map((suggestion: any) => {
        return suggestion;
      });

      return {
        items: resolvedSuggestions,
        len: resolvedSuggestions.length,
        suggestions: suggestions,
        new_items: items,
      };
    }),
  timelineSearchInfinite: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()),
        advance_filters: z.array(z.any()).optional(),
        limit: z.number().optional(),
        sorting: z.any().optional(),
        current: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const _adv_filter = input?.advance_filters?.map((filter) => ({
        operator: filter.operator,
        type: filter.type,
        field: filter.field,
        label: filter.label,
        values: filter.values,
        is_case_sensitive_sorting: false,
      }));
      
      const result_for_total = await ctx.dnaClient
        .filterTimelineRecords({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters:
              _adv_filter || ([] as IAdvanceFilters<string | number>[]),
            group_advance_filters: [],
            order: {
              limit: -1,
            },
          },
        })
        .execute();
      const { data: total_data } = result_for_total;

      const limit = input?.limit || 20;

      const results = await ctx.dnaClient

        .filterTimelineRecords({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters:
              _adv_filter || ([] as IAdvanceFilters<string | number>[]),
            group_advance_filters: [],
            order: {
              starts_at:
                // current 5 *  input.limit 50 = 250
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              is_case_sensitive_sorting: true,
              by_direction: EOrderDirection.DESC,
              by_field: 'timestamp',
              limit: input.limit || 20,
            },
            multiple_sort: [
              // { by_direction: 'desc', by_field: 'created_date' },
              // {
              //   by_direction: 'desc',
              //   by_field: 'created_time',
              //   is_case_sensitive_sorting: false,
              // },
            ],
          },
        })
        .execute();

      const { data: timeline_data, count, record_count } = results;

      // filter data and remove items that have new_value with only 2 or 3 keys
      const filtered_data = filterItems(timeline_data);
      const filter_count = filterItems(total_data);

      const response = await Bluebird.map(filtered_data, async (item) => {
        // if (item.event_name !== 'timeline_organization_contacts') {
        //   return item;
        // }

        const { table, record_id, reference_id } = item;
        let parent_code_new = null;

        if (reference_id) {
          const { data: parent_result } = await ctx.dnaClient
            .filterTimelineRecords({
              entity: ENTITY,
              token: ctx.token.value,
              query: {
                pluck: input.pluck,
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'reference_id',
                    operator: EOperator.EQUAL,
                    values: [reference_id],
                  },
                  {
                    operator: 'and',
                    type: 'operator',
                  },
                  {
                    type: 'criteria',
                    field: 'record_code',
                    operator: EOperator.NOT_CONTAINS,
                    values: ['CTR'],
                  },
                  {
                    operator: 'and',
                    type: 'operator',
                  },
                  ...(input.advance_filters || []),
                ] as IAdvanceFilters<string | number>[],
                group_advance_filters: [],
                order: {
                  limit: 100,
                  starts_at: 0,
                  is_case_sensitive_sorting: true,
                  by_direction: EOrderDirection.DESC,
                  by_field: 'timestamp',
                },
                multiple_sort: [
                  // { by_direction: 'desc', by_field: 'created_date' },
                  // {
                  //   by_direction: 'desc',
                  //   by_field: 'created_time',
                  //   is_case_sensitive_sorting: false,
                  // },
                ],
              },
            })
            .execute();

          if (parent_result?.length) {
            parent_code_new = parent_result?.[0]?.record_code || '';
          }
        }

        const variables = (await ctx.redisClient.getHashValue(
          `schema:${pluralize(table)}`,
          'formatted_with_related_fields',
        )) as any;

        if (!variables) {
          console.error('No variables found for table', table);
          return item;
        }

        const plucks = processDataByFirstDot(variables);
        const splitTable = table.split('_');
        // Processing table and item data

        const parentEntity = pluralize(splitTable[0]);

        if (
          enumParentEntities.includes(parentEntity) ||
          table === 'grid_filters'
        ) {
          const isAlreadyParent = splitTable?.length <= 1;

          const query = ctx.dnaClient.findAll({
            entity: table,
            token: ctx.token.value,
            query: {
              pluck: plucks,
              advance_filters: [
                {
                  type: 'criteria',
                  field: 'id',
                  operator: EOperator.EQUAL,
                  values: [record_id],
                },
              ],
              order: {
                limit: 100,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          });

          const result = await query.execute();
          // Query execution completed

          if (!isAlreadyParent && table !== 'grid_filters') {
            // Flatten the array of arrays into a single array of objects with key and value properties
            const getKeyIDs = result.data.flatMap((item) =>
              Object.keys(item)
                .filter((key) => key.endsWith('_id'))
                .map((key) => ({
                  key,
                  value: item[key],
                })),
            );

            const responseData = await Bluebird.map(getKeyIDs, async (item) => {
              const { key, value } = item;

              let parentTable = key.split('_')?.[0] ?? '';
              if (!parentTable) {
                return {
                  ...item,
                  parent_code_new: parent_code_new,
                  parent_details: {},
                };
              }

              if (key === 'contact_organization_id') {
                parentTable = 'organization';
              }

              const variables = (await ctx.redisClient.getHashValue(
                `schema:${pluralize(parentTable)}`,
                'formatted_with_related_fields',
              )) as any;
              const plucks = processDataByFirstDot(variables);

              const record = await ctx.dnaClient
                .findOne(value, {
                  entity: singular(parentTable),
                  token: ctx.token.value,
                  query: {
                    pluck: plucks,
                  },
                })
                .execute();

              return {
                [parentTable]: record.data?.[0],
              };
            });

            return {
              ...item,
              parent_code_new: parent_code_new,
              parent_details: responseData?.length
                ? responseData.reduce(
                    (acc, curr) => ({ ...acc, ...curr }),
                    {} as Record<string, any>,
                  )
                : {},
            };
          } else if (table === 'grid_filters') {
            return {
              ...item,
              parent_code_new: parent_code_new,
              parent_details: result?.data?.[0],
            };
          }

          return {
            ...item,
            parent_code_new: parent_code_new,
            parent_details: {},
          };
        }
        return { ...item, parent_code_new: parent_code_new };
      }).filter(Boolean);

      return {
        items: response,
        count: count,
        all_record_counts: filter_count?.length || 0,
        totalCount: count,
      };
    }),
  getDataByReferenceId: privateProcedure
    .input(
      z.object({
        reference_id: z.string(),
        pluck: z.array(z.string()).optional(),
        advance_filter: z.array(z.any()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { reference_id, pluck = [], advance_filter } = input;

      const result = await ctx.dnaClient
        .filterTimelineRecords({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: pluck,
            advance_filters: [
              {
                type: 'criteria',
                field: 'reference_id',
                operator: EOperator.EQUAL,
                values: [reference_id],
              },
              {
                operator: 'and',
                type: 'operator',
              },
              {
                type: 'criteria',
                field: 'record_code',
                operator: EOperator.NOT_CONTAINS,
                values: ['CTR'],
              },
              {
                operator: 'and',
                type: 'operator',
              },
              ...(advance_filter || []),
            ] as IAdvanceFilters<string | number>[],
            group_advance_filters: [],
            order: {
              limit: 100,
              starts_at: 0,
              is_case_sensitive_sorting: true,
              by_direction: EOrderDirection.DESC,
              by_field: 'timestamp',
            },
            multiple_sort: [
              // { by_direction: 'desc', by_field: 'created_date' },
              // {
              //   by_direction: 'desc',
              //   by_field: 'created_time',
              //   is_case_sensitive_sorting: false,
              // },
            ],
          },
        })
        .execute();

      const { data: timeline_data, count, record_count } = result;
      return { data: timeline_data, count, totalCount: count };
    }),
});

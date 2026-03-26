import { EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'
import { formatSorting } from '~/server/utils/formatSorting';
const entity = 'device_rules'
export const deviceRuleRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  mainGrid: privateProcedure
    .input(ZodItems.extend({
      device_id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        pluck,
        device_id,
        sorting,
        // @ts-expect-error - No type yet
        is_case_sensitive_sorting = "false"
      } = input
      const _sorting = sorting // ?.filter(({id}: {id: string}) => ['created_by', 'updated_by'].includes(id))

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

      if (!device_conf_id) {
        return {
          totalCount: 0,
          items: [],
          currentPage: 1,
          totalPages: 1,
        }
      }

      const device_rules = await ctx.dnaClient.findAll({
        entity: 'device_filter_rules',
        token: ctx.token.value,
        query: {
          track_total_records: true,
          pluck,
          pluck_object:{
            device_rules: pluck
          },
          advance_filters: _advance_filters?.length
            ? [
              ..._advance_filters,
              {
                operator: 'and',
                type: 'operator',
              },
              {
                type: 'criteria',
                field: 'device_configuration_id',
                entity: 'device_filter_rules',
                operator: 'equal',
                values: [device_conf_id],
              }
            ] as IAdvanceFilters[]
            : createAdvancedFilter({
              device_configuration_id: device_conf_id,
              status: 'Active',
            }) as IAdvanceFilters[],

          order: {
            starts_at:
            (input.current || 0) === 0
              ? 0
              : (input.current || 1) * (input.limit || 100)
                - (input.limit || 100),
            limit: input.limit || 1,
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
          multiple_sort: _sorting?.length
            ? formatSorting(_sorting, 'device_filter_rules', is_case_sensitive_sorting)
            : [],
            concatenate_fields: [
            {
              fields: ['ipprotocol', 'protocol'],
              field_name: 'protocol',
              separator: ' ',
              entity: 'device_filter_rules',
            },
          ]
        },
      })
      if (input.grouping?.length) {
        device_rules.groupBy({
          query: {
            fields: input.grouping,
            has_count: true,
          },
        });
      }

      let { total_count: totalCount = 1, data: items }
      = await device_rules.execute()

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);

      if (input.grouping?.length) {
        return {
          totalCount,
          items: items,
          currentPage: 0,
          totalPages,
        };
      }

      const groupedItems = items.reduce((acc, curr) => {
        if (curr.interface === 'wan') {
          return {
            ...acc,
            wan: [...acc.wan, curr]
          }
        } else {
          return {
            ...acc,
            lan: [...acc.lan, curr]
          }
        }
      }, {
        wan: [],
        lan: []
      })
      const orderSort = _sorting?.find?.((s: { id?: string, desc?: boolean }) => s?.id === 'order')
      const isOrderDesc = orderSort?.desc === true
      const lanLength = groupedItems.lan.length
      items = [
        ...groupedItems.wan,
        ...groupedItems.lan.map((e: Record<string, any>, index: number) => {
          return {
            ...e,
            order: isOrderDesc ? (lanLength - 1 - index) : index,
          }
        })]
      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          created_by: 'Wallguard Client',
          updated_by: 'Wallguard Client',
        }
      })

      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),

})

import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import Bluebird from 'bluebird';
import moment from 'moment-timezone';
import { z } from 'zod';

import { getFlagDetails } from '~/app/api/device/get_flags';
// import { isPrivateIp } from '~/app/portal/device/record/[code]/_components/dashboard/Map/traffic-map-leaflet/checkSourceIPS'
import {
  getAllTimestampsBetweenDates,
  parseTimeString,
} from '~/app/portal/device/utils/timeRange';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

import { createDefineRoutes } from '../baseCrud';
import _, { get } from 'lodash';

interface InputData {
  bucket: string;
  bandwidth: string;
}

interface OutputData {
  bucket: string;
  bandwidth: number;
}

function interchangeResolution(resolution: string): string {
  if (!resolution) return resolution;

  // Match the pattern (e.g., 'm3', 'h1') and rearrange it
  const regex = /^([a-zA-Z]+)(\d+)$/;
  const match = regex.exec(resolution);
  if (match) {
    const [, unit, value] = match; // Extract unit (e.g., 'm') and value (e.g., '3')
    return `${value}${unit}`; // Rearrange to '3m'
  }

  return resolution; // Return as-is if it doesn't match the pattern
}

export function cleanFilter(filters: any) {
  const extracted: {
    'Time Range': string | null;
    Resolution: string | null;
    'Graph Type': string | null;
  } = {
    'Time Range': null,
    Resolution: null,
    'Graph Type': null,
  };

  const newFilters = [];
  let skipNext = false;

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];

    if (skipNext) {
      skipNext = false; // Skip the next operator
      continue;
    }

    if (filter.field === 'Time Range') {
      extracted['Time Range'] = filter['Time Range'];
      skipNext = filters[i + 1]?.operator === 'and'; // Mark next operator for removal
    } else if (filter.field === 'Resolution') {
      extracted.Resolution = interchangeResolution(filter.Resolution);
      skipNext = filters[i + 1]?.operator === 'and'; // Mark next operator for removal
    } else if (filter.field === 'Graph Type') {
      extracted['Graph Type'] = filter['Graph Type'];
      skipNext = filters[i + 1]?.operator === 'and'; // Mark next operator for removal
    } else {
      newFilters.push(filter);
    }
  }

  return {
    extracted,
    newFilters,
  };
}

function transformData(data: InputData[]): OutputData[] {
  const result = data.map((item) => {
    return {
      ...item,
      bandwidth: parseInt(item.bandwidth),
    };
  });

  return result;
}

// function mergeCriteria(filters: IAdvanceFilter[]) {
//   const criteriaMap = new Map()
//   const result = []

//   for (const item of filters) {
//     if (item.type === 'criteria') {
//       const key = `${item.entity}|${item.field}|${item.operator}`

//       if (criteriaMap.has(key)) {
//         // Merge values while ensuring uniqueness
//         const existingCriteria = criteriaMap.get(key)
//         existingCriteria.values = [...new Set([...existingCriteria.values, ...(item.values || [])])]
//       }
//       else {
//         // Store new criteria
//         criteriaMap.set(key, { ...item })
//         result.push(criteriaMap.get(key))
//       }
//     }
//     else if (item.type === 'operator') {
//       // Push operator only if the last added item is NOT an operator
//       if (result.length > 0 && result[result.length - 1].type !== 'operator') {
//         result.push(item)
//       }
//     }
//   }

//   // Remove last operator if it's left at the end
//   if (result.length > 0 && result[result.length - 1].type === 'operator') {
//     result.pop()
//   }

//   return result
// }

export const packetRouter = createTRPCRouter({
  ...createDefineRoutes('connections'),
  getBandwithPerSecond: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        bucket_size: z.string(),
        time_range: z.array(z.string()),
        timezone: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { device_id, bucket_size, timezone } = input;

      const res = await ctx.dnaClient
        .aggregate({
          query: {
            entity: 'connections',
            aggregations: [
              {
                aggregation: 'SUM',
                aggregate_on: 'total_byte',
                bucket_name: 'bandwidth',
              },
            ],
            advance_filters: [
              {
                type: 'criteria' as const,
                field: 'device_id',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [device_id],
              },
            ],
            joins: [],
            bucket_size,
            limit: 20,
            order: {
              order_by: 'bucket',
              order_direction: EOrderDirection.DESC,
            },
            timezone,
          },
          token: ctx.token.value,
        })
        .execute();
      const transformedData: OutputData[] = transformData(
        res?.data as InputData[],
      );

      return transformedData.sort((a, b) => a.bucket.localeCompare(b.bucket));
    }),

  fetchPacketsIP: privateProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const formattedDate = moment(oneDayAgo).format(
        'YYYY-MM-DD HH:mm:ss.SSSZ',
      );

      const { account } = ctx.session;
      const { contact } = account;

      const { filter, search }: any = await Promise.all(
        ['filter', 'search'].map(
          async (type) =>
            await ctx.redisClient.getCachedData(
              `timeline_${type}_${contact.id}`,
            ),
        ),
      );

      const filter_id = '01JNQTACVP5MR3TBZVZGMY6QCH';
      const findFilter = filter?.find((item: any) => item?.id === filter_id);
      const _filter = findFilter?.default_filter;
      const custom_adv = [
        ..._filter,
        {
          type: 'operator',
          operator: EOperator.AND,
        },
        ...search,
        {
          type: 'operator',
          operator: EOperator.AND,
        },
      ];

      const res = await ctx.dnaClient
        .findAll({
          entity: 'connections',
          token: ctx.token.value,
          query: {
            pluck: ['source_ip', 'timestamp'],
            advance_filters: [
              ...custom_adv,
              {
                type: 'criteria',
                field: 'status',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: ['Active', 'active'],
              },
              {
                type: 'operator',
                operator: EOperator.OR,
              },
              {
                type: 'criteria',
                field: 'timestamp',
                entity: 'connections',
                operator: EOperator.GREATER_THAN_OR_EQUAL,
                values: [formattedDate],
              },
            ],
            order: {
              limit: 10,
              by_field: 'code',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();
      return res?.data;
    }),

  getBandwith: privateProcedure
    .input(
      z.object({
        bucket_size: z.string().nullable(),
        time_range: z.array(z.string()),
        timezone: z.string(),
        device_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { bucket_size, time_range, timezone, device_id } = input;
      if (!bucket_size) {
        return [];
      }
      const res = await ctx.dnaClient
        .aggregate({
          query: {
            entity: 'connections',
            aggregations: [
              {
                aggregation: 'SUM',
                aggregate_on: 'total_byte',
                bucket_name: 'bandwidth',
              },
              {
                aggregation: 'SUM',
                aggregate_on: 'total_packet',
                bucket_name: 'packet',
              },
            ],
            advance_filters: [
              {
                type: 'criteria',
                field: 'timestamp',
                entity: 'connections',
                operator: EOperator.IS_BETWEEN,
                values: time_range,
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria',
                field: 'device_id',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [device_id],
              },
            ],
            joins: [],
            bucket_size,
            order: {
              order_by: 'bucket',
              order_direction: EOrderDirection.DESC,
            },
            timezone,
            limit: 60,
          },
          token: ctx.token.value,
        })
        .execute();

      const [start, end] = time_range || {};
      const _start = moment(start as string)
        .tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss');
      const _end = moment(end as string)
        .tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss');

      // const unit = bucket_size.slice(-1)
      // const unitFull = getUnit(unit)
      //
      const { unit, value = '' } = (parseTimeString(bucket_size) as any) || {};

      const timestamps = getAllTimestampsBetweenDates(
        _start,
        _end,
        unit,
        value,
      ).slice(-60);

      const result = timestamps.map((item) => {
        const data = res?.data.find((element: any) =>
          element.bucket?.replace('T', ' ')?.includes(item),
        );
        if (data) {
          const bandwidth =
            typeof data.bandwidth === 'string'
              ? parseInt(data.bandwidth, 10)
              : (data.bandwidth ?? 0);
          return {
            bucket: item,
            bandwidth,
            bandwidth_formatted: bandwidth.toLocaleString('en-US'),
            packet: data.packet,
          };
        }
        return {
          bucket: item,
          bandwidth: 0,
          bandwidth_formatted: '0',
          packet: 0,
        };
      });

      return result;
    }),
  getBandwithInterfacePerSecond: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        bucket_size: z.string(),
        time_range: z.array(z.string()).optional(),
        timezone: z.string(),
        interface_names: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, bucket_size, time_range, timezone, interface_names } =
        input;

      if (interface_names?.length) {
        const res = await Promise.all(
          interface_names.map(async (interface_name: string) => {
            const res = await ctx.dnaClient
              .aggregate({
                query: {
                  entity: 'connections',
                  aggregations: [
                    {
                      aggregation: 'SUM',
                      aggregate_on: 'total_byte',
                      bucket_name: 'bandwidth',
                    },
                    {
                      aggregation: 'SUM',
                      aggregate_on: 'total_packet',
                      bucket_name: 'packet',
                    },
                  ],
                  advance_filters: [
                    {
                      type: 'criteria' as const,
                      field: 'interface_name',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [interface_name],
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria' as const,
                      field: 'device_id',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [device_id],
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria',
                      field: 'timestamp',
                      entity: 'connections',
                      operator: EOperator.IS_BETWEEN,
                      values: time_range,
                    },
                  ],
                  joins: [],
                  bucket_size,
                  limit: 60,
                  order: {
                    order_by: 'bucket',
                    order_direction: EOrderDirection.DESC,
                  },
                  timezone,
                },
                token: ctx.token.value,
              })
              .execute();
            const transformedData: OutputData[] = transformData(
              res?.data as InputData[],
            );
            return {
              [interface_name]: transformedData.sort((a, b) =>
                a.bucket.localeCompare(b.bucket),
              ),
            };
          }),
        );
        // data = [{"vtnet1":[]},{"vtnet0":[{"bucket":"2025-03-01 13:43:22","bandwidth":634},{"bucket":"2025-03-01 13:43:23","bandwidth":382}]}]

        // [ { bucket: "2024-04-01", bandwidth: 222, static_bandwidth: 150 },  { bucket: "2024-04-02", bandwidth: 97, static_bandwidth: 180 }]
        const [start, end] = time_range || [];
        const _start = moment(start as string)
          .tz(timezone)
          .format('YYYY-MM-DD HH:mm:ss');
        const _end = moment(end as string)
          .tz(timezone)
          .format('YYYY-MM-DD HH:mm:ss');

        const { unit, value = '' } =
          (parseTimeString(bucket_size) as any) || {};

        const timestamps = getAllTimestampsBetweenDates(
          _start,
          _end,
          unit,
          value,
        );

        const transform_data = timestamps?.map((item) => {
          const interface_val = res?.reduce((acc, intrfce: any) => {
            const [key, val] = Object.entries(intrfce)?.[0] as any;

            const same_val = val?.find((element: any) => {
              return element.bucket.replace('T', ' ') === item;
            });
            return {
              ...acc,
              [key]: same_val?.bandwidth || 0,
              [`${key}_packet`]: same_val?.packet || 0,
            };
          }, {});

          return {
            bucket: item,
            ...interface_val,
          };
        });

        return transform_data;
      }

      const res = await ctx.dnaClient
        .aggregate({
          query: {
            entity: 'connections',
            aggregations: [
              {
                aggregation: 'SUM',
                aggregate_on: 'total_byte',
                bucket_name: 'bandwidth',
              },
            ],
            advance_filters: [
              {
                type: 'criteria' as const,
                field: 'device_id',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [device_id],
              },
            ],
            joins: [],
            bucket_size,
            limit: 21,
            order: {
              order_by: 'bucket',
              order_direction: EOrderDirection.DESC,
            },
            timezone,
          },
          token: ctx.token.value,
        })
        .execute();

      const transformedData: OutputData[] = transformData(
        res?.data as InputData[],
      );

      const transformed = transformedData.sort((a, b) =>
        a.bucket.localeCompare(b.bucket),
      );

      return transformed;
    }),
  getLastBandwithInterfacePerSecond: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        bucket_size: z.string(),
        time_range: z.array(z.string()).optional(),
        timezone: z.string(),
        interface_names: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, bucket_size, time_range, timezone, interface_names } =
        input;

      if (!interface_names) {
        return [];
      }

      const results = await Promise.all(
        interface_names.map(async (interface_name) => {
          try {
            const res = await ctx.dnaClient
              .aggregate({
                query: {
                  entity: 'connections',
                  aggregations: [
                    {
                      aggregation: 'SUM',
                      aggregate_on: 'total_byte',
                      bucket_name: 'bandwidth',
                    },
                  ],
                  advance_filters: [
                    {
                      type: 'criteria' as const,
                      field: 'interface_name',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [interface_name],
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria' as const,
                      field: 'device_id',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [device_id],
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria',
                      field: 'timestamp',
                      entity: 'connections',
                      operator: EOperator.IS_BETWEEN,
                      values: time_range,
                    },
                  ],
                  joins: [],
                  bucket_size,
                  limit: 2,
                  order: {
                    order_by: 'bucket',
                    order_direction: EOrderDirection.DESC,
                  },
                  timezone,
                },
                token: ctx.token.value,
              })
              .execute();

            return res?.data?.reduce(
              (acc, curr) => acc + parseInt(curr.bandwidth || '0') || 0,
              0,
            );
          } catch (error) {
            return 0;
          }
        }),
      );
      const total = results.reduce((sum, val) => sum + val, 0);
      return total;
    }),
  getBandwidthOfSourceIPandDestinationIP: privateProcedure
    .input(z.object({ packet_data: z.any() }))
    .query(async ({ input, ctx }) => {
      const { packet_data } = input;
      return await Bluebird.map(
        packet_data,
        async (item: { source_ip: string; destination_ip: string }) => {
          const { source_ip, destination_ip } = item;
          const res = await ctx.dnaClient
            .aggregate({
              // @ts-expect-error - entity is not defined in the type
              query: {
                entity: 'connections',
                aggregations: [
                  {
                    aggregation: 'SUM',
                    aggregate_on: 'total_length',
                    bucket_name: 'bandwidth',
                  },
                ],
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'source_ip',
                    entity: 'connections',
                    operator: EOperator.EQUAL,
                    values: [source_ip],
                  },
                  {
                    type: 'operator',
                    operator: EOperator.AND,
                  },
                  {
                    type: 'criteria',
                    field: 'destination_ip',
                    entity: 'connections',
                    operator: EOperator.EQUAL,
                    values: [destination_ip],
                  },
                ],
                joins: [],
                limit: 20,
                order: {
                  order_by: 'bucket',
                  order_direction: EOrderDirection.DESC,
                },
              },
              token: ctx.token.value,
            })
            .execute();

          return { source_ip, destination_ip, result: res?.data };
        },
        { concurrency: 10 },
      );
    }),
  getBandwidthOfSourceIPandDestinationIPAction: privateProcedure
    .input(z.object({ packet_data: z.any() }))
    .mutation(async ({ input, ctx }) => {
      const { packet_data } = input;
      return await Bluebird.map(
        packet_data,
        async (item: { source_ip: string; destination_ip: string }) => {
          const { source_ip, destination_ip } = item;
          const res = await ctx.dnaClient
            .aggregate({
              // @ts-expect-error - entity is not defined in the type
              query: {
                entity: 'connections',
                aggregations: [
                  {
                    aggregation: 'SUM',
                    aggregate_on: 'total_length',
                    bucket_name: 'bandwidth',
                  },
                ],
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'source_ip',
                    entity: 'connections',
                    operator: EOperator.EQUAL,
                    values: [source_ip],
                  },
                  {
                    type: 'operator',
                    operator: EOperator.AND,
                  },
                  {
                    type: 'criteria',
                    field: 'destination_ip',
                    entity: 'connections',
                    operator: EOperator.EQUAL,
                    values: [destination_ip],
                  },
                ],
                joins: [],
                limit: 20,
                order: {
                  order_by: 'bucket',
                  order_direction: EOrderDirection.DESC,
                },
              },
              token: ctx.token.value,
            })
            .execute();

          return { source_ip, destination_ip, result: res?.data };
        },
        { concurrency: 10 },
      );
    }),
  filterPackets: privateProcedure
    .input(
      z.object({
        _query: z.string().default(''),
        device_id: z.string(),
        time_range: z.array(z.string()).length(2),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        time_range: timeRange,
        device_id: deviceId,
        _query: query,
      } = input;

      const isIpLike = /^\d[\d.]*$/.test(query);
      const isPartialIp = /^\d+(\.\d*)+$/.test(query);
      const ipSearchValue = isPartialIp ? `${query}%` : `%${query}%`;

      const connPromise = isIpLike
        ? ctx.dnaClient
            .findAll({
              entity: 'connections',
              token: ctx.token.value,
              query: {
                pluck: [
                  'id',
                  'status',
                  'interface_name',
                  'source_ip',
                  'destination_ip',
                  'timestamp',
                  'protocol',
                ],
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'source_ip',
                    entity: 'connections',
                    operator: EOperator.LIKE,
                    values: [ipSearchValue],
                    parse_as: 'text',
                  },
                  { type: 'operator', operator: EOperator.AND },
                  {
                    type: 'criteria',
                    field: 'device_id',
                    entity: 'connections',
                    operator: EOperator.EQUAL,
                    values: [deviceId],
                  },
                  { type: 'operator', operator: EOperator.AND },
                  {
                    type: 'criteria',
                    field: 'timestamp',
                    entity: 'connections',
                    operator: EOperator.IS_BETWEEN,
                    values: timeRange,
                  },
                ],
                order: {
                  limit,
                  by_field: 'code',
                  by_direction: EOrderDirection.DESC,
                  is_case_sensitive_sorting: true,
                },
              },
            })
            .execute()
            .catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });

      const [connRes, ipInfoRes] = await Promise.all([
        connPromise,
        ctx.dnaClient
          .findAll({
            entity: 'ip_infos',
            token: ctx.token.value,
            query: {
              pluck: ['ip', 'country'],
              advance_filters: [
                {
                  type: 'criteria',
                  field: 'country',
                  entity: 'ip_infos',
                  operator: EOperator.LIKE,
                  values: [`${query}%`],
                },
              ],
              order: {
                limit,
                by_field: 'code',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()
          .catch(() => ({ data: [] })),
      ]);

      const uniqueConnections = _.uniqBy(connRes?.data ?? [], 'source_ip');
      const uniqueIpInfos = _.uniqBy(ipInfoRes?.data ?? [], 'country');

      return {
        items: [...uniqueConnections, ...uniqueIpInfos],
        _query: query,
      };
    }),
  getBandwidthOfSourceIP: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        time_range: z.array(z.string()),
        bucket_size: z.string(),
        source_ips: z.array(z.string()),
        limit: z.number().optional(),
        use_chunks: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        device_id,
        time_range,
        bucket_size = '1s',
        source_ips,
        limit = 60,
      } = input;

      const ips = await Bluebird.map(
        source_ips,
        async (source_ip: string) => {
          const ipInfoCacheKey = `ip_info:${source_ip}`;
          const cachedIpInfo =
            await ctx.redisClient.getCachedData(ipInfoCacheKey);

          const [bandwidthData, ipInfoData] = await Promise.all([
            ctx.dnaClient
              .aggregate({
                query: {
                  entity: 'connections',
                  aggregations: [
                    {
                      aggregation: 'SUM',
                      aggregate_on: 'total_byte',
                      bucket_name: 'bandwidth',
                    },
                  ],
                  advance_filters: [
                    {
                      type: 'criteria',
                      field: 'timestamp',
                      entity: 'connections',
                      operator: EOperator.IS_BETWEEN,
                      values: time_range,
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria' as const,
                      field: 'source_ip',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [source_ip],
                    },
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria',
                      field: 'device_id',
                      entity: 'connections',
                      operator: EOperator.EQUAL,
                      values: [device_id],
                    },
                  ],
                  joins: [],
                  bucket_size,
                  order: {
                    order_by: 'bucket',
                    order_direction: EOrderDirection.DESC,
                  },
                  timezone: 'Asia/Manila',
                  limit: limit || 60,
                },
                token: ctx.token.value,
              })
              .execute()
              .then((res) => res?.data ?? []),

            cachedIpInfo
              ? Promise.resolve(cachedIpInfo)
              : ctx.dnaClient
                  .findAll({
                    entity: 'ip_info',
                    token: ctx.token.value,
                    query: {
                      advance_filters: [
                        {
                          type: 'criteria',
                          field: 'ip',
                          operator: EOperator.EQUAL,
                          values: [source_ip],
                        },
                      ],
                      order: {
                        limit: 10,
                        by_field: 'ip',
                        by_direction: EOrderDirection.DESC,
                      },
                      pluck: ['country', 'region', 'city', 'ip'],
                    },
                  })
                  .execute()
                  .then(async (res) => {
                    const data = res?.data ?? [];
                    await ctx.redisClient.cacheData(
                      ipInfoCacheKey,
                      data,
                      3_600_000,
                    );
                    return data;
                  }),
          ]);

          const flagDetails = await getFlagDetails(
            (ipInfoData as any[])?.[0]?.country,
          );
          return { source_ip, result: bandwidthData, ...flagDetails };
        },
        { concurrency: 5 },
      );

      return { data: ips };
    }),

  getUniqueSourceIP: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        time_range: z.array(z.string()),
        filter_id: z.string(),
        limit: z.number().optional().default(10),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, time_range, filter_id, limit } = input;

      let source_ips: string[] = [];

      const filterConnections = async (starts_at: number) => {
        const { account } = ctx.session;
        const { contact } = account;

        let [__filter = [], search = []]: any = await Promise.all(
          ['filter', 'search'].map(
            async (type) =>
              await ctx.redisClient.getCachedData(
                `timeline_${type}_${contact.id}`,
              ),
          ),
        );
        search = search ?? [];

        const findFilter = Array.isArray(__filter)
          ? __filter?.find((item: any) => item?.id === filter_id)
          : undefined;

        let _filter = findFilter?.group_advance_filters || [];
        // @ts-expect-error - Fix no type yet
        _filter = _filter.map((e) => {
          if (e.filters) {
            return {
              ...e,
              // @ts-expect-error - Fix no type yet
              filters: e.filters.map((filter) => {
                if (Array.isArray(filter.values)) {
                  return filter;
                }
                return {
                  ...filter,
                  values: [filter.values],
                };
              }),
            };
          }
          return e;
        });
        console.log(`#@#@ filters`, JSON.stringify(_filter));

        const [, , ...rest_group_filter] = _filter || [];
        // Separate filters for "country"
        const countryFilters = rest_group_filter.filter((filter: any) => {
          if (filter.type === 'criteria' && Array.isArray(filter.filters)) {
            return filter.filters.some(
              (subFilter: any) => subFilter.field === 'country',
            );
          }
          return false;
        });

        // Remove "country" filters from the original rest_group_filter
        const otherFilters = rest_group_filter.filter((filter: any) => {
          if (filter.type === 'criteria' && Array.isArray(filter.filters)) {
            return !filter.filters.some(
              (subFilter: any) => subFilter.field === 'country',
            );
          }
          return true;
        });

        let { entitySearch, otherEntitySearch } = search?.reduce(
          (acc: any, item: any) => {
            if (item.entity === 'connections') {
              acc.entitySearch.push(item);
            } else if (item.entity === 'ip_infos') {
              acc.otherEntitySearch.push(item);
            }
            return acc;
          },
          { entitySearch: [], otherEntitySearch: [] },
        );

        // @ts-expect-error - No type yet
        entitySearch = entitySearch.reduce((acc, curr) => {
          return [
            ...acc,
            curr,
            {
              type: 'operator',
              operator: EOperator.OR,
            },
          ];
        }, []);
        entitySearch.pop();

        let default_filters: any = [
          ...(entitySearch?.length
            ? [
                ...(entitySearch || []),
                {
                  type: 'operator',
                  operator: EOperator.AND,
                },
              ]
            : []),
          {
            type: 'criteria',
            field: 'timestamp',
            entity: 'connections',
            operator: EOperator.IS_BETWEEN,
            values: time_range,
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'device_id',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: [device_id],
          },
          ...(source_ips?.length
            ? [
                {
                  type: 'operator',
                  operator: EOperator.AND,
                },
                {
                  type: 'criteria',
                  field: 'source_ip',
                  entity: 'connections',
                  operator: EOperator.NOT_EQUAL,
                  values: source_ips,
                },
              ]
            : []),
        ]?.map((item: any) => ({
          ...item,
          entity: 'connections',
        }));

        default_filters = {
          type: 'criteria',
          filters: default_filters,
        };

        const group_advance_filters = [
          default_filters,
          ...(otherFilters?.length
            ? [
                {
                  type: 'operator',
                  operator: 'and',
                },
                ...otherFilters,
              ]
            : []),
        ];
        // Country searches cross-join connections → ip_infos by source_ip.
        // A larger initial fetch window is needed to gather enough raw rows
        // so that the subsequent ip_infos filter yields a sufficient result set.
        const MAX_COUNTRY_SEARCH_LIMIT = 500;
        const hasSearchCountry =
          otherEntitySearch.length &&
          otherEntitySearch[0]?.entity === 'ip_infos';

        const connections = await ctx.dnaClient
          .findAll({
            entity: 'connections',
            token: ctx.token.value,
            query: {
              track_total_records: true,
              pluck: ['source_ip', 'timestamp'],
              ...(group_advance_filters?.length > 1
                ? { group_advance_filters }
                : { advance_filters: group_advance_filters?.[0]?.filters }),
              order: {
                starts_at,
                limit: hasSearchCountry ? MAX_COUNTRY_SEARCH_LIMIT : limit,
                // limit: group_advance_filters?.length > 1? limit : 50,
                by_field: 'timestamp',
                by_direction: EOrderDirection.DESC,
                is_case_sensitive_sorting: true,
              },
              //   multiple_sort: [
              //     {
              //         "by_field": "connections.source_ip",
              //         "by_direction": EOrderDirection.ASC
              //     }
              // ]
            },
          })
          .groupBy({
            query: { fields: ['source_ip'] },
          })
          .execute();

        let _connections = connections?.data || [];

        // _connections = _connections.map(e => {
        //   return {
        //     connections: {
        //       source_ip: e?.source_ip,
        //     }
        //   }
        // })

        const _connections_length = _connections.length;

        const sourceIPs = new Set();
        for (let i = 0; i < _connections_length; i++) {
          if (_connections?.[i]) {
            sourceIPs.add((_connections[i]?.connections as any).source_ip);
          }
        }
        // 209.58.181.171
        source_ips = [...new Set([...source_ips, ...sourceIPs])] as string[];
        source_ips = source_ips.slice(0, limit);
        if (countryFilters?.length) {
          const _res = await Bluebird.map(
            source_ips,
            async (source_ip: string) => {
              const res = await ctx.dnaClient
                .findAll({
                  entity: 'ip_info',
                  token: ctx.token.value,
                  query: {
                    advance_filters: [
                      {
                        type: 'criteria',
                        field: 'ip',
                        operator: EOperator.EQUAL,
                        values: [source_ip],
                      },
                      {
                        type: 'operator',
                        operator: EOperator.AND,
                      },
                      ...(Array.isArray(countryFilters) &&
                      countryFilters.length > 0
                        ? countryFilters[0]?.filters || []
                        : []),
                    ],
                    order: {
                      limit: 10,
                      by_field: 'ip',
                      by_direction: EOrderDirection.DESC,
                    },
                    pluck: ['country', 'region', 'city', 'ip'],
                  },
                })
                .execute();

              if (!res?.data?.length) return null;
              return { result: res?.data };
            },
            { concurrency: 100 },
          );

          if (_connections_length == limit && source_ips.length < limit) {
            const new_start = starts_at + limit;
            await filterConnections(new_start);
          }
          const ips_with_country = _res
            ?.filter(Boolean)
            ?.map((item) => item?.result?.[0]?.ip);
          source_ips = ips_with_country as string[];
          return _res?.filter(Boolean);
        } else {
          // If there's Other Entity Advance Filters = ip_infos
          if (
            source_ips?.length &&
            otherEntitySearch.length &&
            otherEntitySearch[0]?.entity === 'ip_infos'
          ) {
            // Filter Source IPs
            const filteredSourceIPs = await Bluebird.filter(
              source_ips,
              async (source_ip: string) => {
                const resIpInfo = await ctx.dnaClient
                  .findAll({
                    entity: 'ip_infos',
                    token: ctx.token.value,
                    query: {
                      advance_filters: [
                        {
                          type: 'criteria',
                          field: 'ip',
                          operator: EOperator.EQUAL,
                          values: [source_ip],
                        },
                        {
                          type: 'operator',
                          operator: EOperator.AND,
                        },
                        {
                          type: 'criteria',
                          field: 'country',
                          operator: EOperator.EQUAL,
                          values: otherEntitySearch?.[0]?.values,
                        },
                      ],
                      order: {
                        limit: 1,
                        by_field: 'ip',
                        by_direction: EOrderDirection.DESC,
                      },
                      pluck: ['ip', 'country'],
                    },
                  })
                  .execute();

                return resIpInfo?.data?.length > 0;
              },
              { concurrency: 100 },
            );
            source_ips = filteredSourceIPs;
          }
          if (
            source_ips.length < limit &&
            _connections_length > 0 &&
            !hasSearchCountry
          ) {
            const new_start = starts_at + limit;
            await filterConnections(new_start);
          }
        }
      };

      await filterConnections(0);

      return source_ips || [];
    }),

  // Modified backend procedure
  getUniqueSourceAndDestinationIP: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        time_range: z.array(z.string()),
        filter_id: z.string(),
        batch_size: z.number().optional().default(100), // Number of records to fetch per batch
        batch_offset: z.number().optional().default(0), // Starting position for the batch
        address: z
          .object({
            country: z.string().optional(),
            country_code: z.string().optional(),
            // state: z.string().optional(),
            city: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        device_id,
        time_range,
        batch_size = 10,
        batch_offset = 0,
        filter_id,
        address,
      } = input;
      let source_and_destination_ips: Record<string, any>[] = [];

      const filterConnections = async () => {
        const connections: any = await ctx.dnaClient
          .findAll({
            entity: 'connections',
            token: ctx.token.value,
            query: {
              // track_total_records: true,
              pluck: [
                'source_ip',
                'timestamp',
                'destination_ip',
                'total_byte',
                'timestamp',
              ],
              advance_filters: [
                {
                  type: 'criteria',
                  field: 'timestamp',
                  entity: 'connections',
                  operator: EOperator.IS_BETWEEN,
                  values: time_range,
                },
                {
                  type: 'operator',
                  operator: EOperator.AND,
                },
                {
                  type: 'criteria',
                  field: 'device_id',
                  entity: 'connections',
                  operator: EOperator.EQUAL,
                  values: [device_id],
                },
              ],
              order: {
                // starts_at: batch_offset, // Use the batch_offset parameter
                // limit: batch_size, // Use the batch_size parameter
                limit: 20,
                by_field: 'timestamp',
                by_direction: EOrderDirection.DESC,
                is_case_sensitive_sorting: true,
              },
            },
          })
          .execute();

        const _connections = connections?.data || [];
        const _connections_length = _connections.length;
        const total_records = connections?.total_records || 0; // Get total record count for client pagination

        const sourceAndDestinationIPs = new Set();
        for (let i = 0; i < _connections_length; i++) {
          if (_connections?.[i]) {
            sourceAndDestinationIPs.add({
              source_ip: (_connections[i] as any).source_ip,
              destination_ip: (_connections[i] as any).destination_ip,
              total_byte: (_connections[i] as any).total_byte,
              timestamp: (_connections[i] as any).timestamp,
            });
          }
        }
        source_and_destination_ips = [...sourceAndDestinationIPs] as Record<
          string,
          any
        >[];

        return {
          connections: source_and_destination_ips,
          batch_info: {
            total_records,
            has_more: total_records > batch_offset + batch_size,
            next_offset: batch_offset + batch_size,
          },
        };
      };

      const { account } = ctx.session;
      const { contact } = account;

      const [filter = [], search = []]: any = await Promise.all(
        ['filter', 'search'].map(
          async (type) =>
            await ctx.redisClient.getCachedData(`map_filter_${contact.id}`),
        ),
      );

      const findFilter = filter?.find((item: any) => item?.id === filter_id);

      const { connections, batch_info } = await filterConnections();

      // Process this batch of IPs
      let _res = await Bluebird.map(
        connections,
        async (ips: Record<string, any>) => {
          const source_country = await ctx.dnaClient
            .findAll({
              entity: 'ip_info',
              token: ctx.token.value,
              query: {
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'ip',
                    operator: EOperator.EQUAL,
                    values: [ips?.source_ip],
                  },
                ],
                order: {
                  limit: 10,
                  by_field: 'ip',
                  by_direction: EOrderDirection.DESC,
                },
                pluck: ['country', 'region', 'city', 'ip'],
              },
            })
            .execute();

          const destination_country = await ctx.dnaClient
            .findAll({
              entity: 'ip_info',
              token: ctx.token.value,
              query: {
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'ip',
                    operator: EOperator.EQUAL,
                    values: [ips?.destination_ip],
                  },
                ],
                order: {
                  limit: 10,
                  by_field: 'ip',
                  by_direction: EOrderDirection.DESC,
                },
                pluck: ['country', 'region', 'city', 'ip'],
              },
            })
            .execute();

          const sourceIp = ips?.source_ip as string | undefined;
          const sourceIpFirstOctet = (() => {
            if (typeof sourceIp !== 'string') return null;
            const [first] = sourceIp.split('.');
            const octet = Number(first);
            if (!Number.isInteger(octet)) return null;
            if (octet < 0 || octet > 255) return null;
            return octet;
          })();

          const sourceIpClass =
            sourceIpFirstOctet === null
              ? null
              : sourceIpFirstOctet >= 0 && sourceIpFirstOctet <= 127
                ? 'A'
                : sourceIpFirstOctet >= 128 && sourceIpFirstOctet <= 191
                  ? 'B'
                  : sourceIpFirstOctet >= 192 && sourceIpFirstOctet <= 223
                    ? 'C'
                    : null;

          const isSourceIpClassABC = sourceIpClass !== null;
          const sourceIpInfo = source_country?.data?.[0];
          const resolvedSourceCountry =
            sourceIpInfo ??
            (isSourceIpClassABC && address
              ? {
                  country: address?.country_code ?? 'No IP Info',
                  region: 'No IP Info', // address?.state ?? 'No IP Info',
                  city: address?.city ?? 'No IP Info',
                  ip: ips?.source_ip,
                }
              : {
                  country: 'No IP Info',
                  region: 'No IP Info',
                  city: 'No IP Info',

                  // country: 'NL',
                  // region: 'North Holland',
                  // city: 'Amsterdam',

                  // country: 'US',
                  // region: 'Virginia',
                  // city: 'Ashburn',

                  ip: ips?.source_ip,
                });

          const destinationIp = ips?.destination_ip as string | undefined;
          const destinationIpFirstOctet = (() => {
            if (typeof destinationIp !== 'string') return null;
            const [first] = destinationIp.split('.');
            const octet = Number(first);
            if (!Number.isInteger(octet)) return null;
            if (octet < 0 || octet > 255) return null;
            return octet;
          })();

          const destinationIpClass =
            destinationIpFirstOctet === null
              ? null
              : destinationIpFirstOctet >= 0 && destinationIpFirstOctet <= 127
                ? 'A'
                : destinationIpFirstOctet >= 128 &&
                    destinationIpFirstOctet <= 191
                  ? 'B'
                  : destinationIpFirstOctet >= 192 &&
                      destinationIpFirstOctet <= 223
                    ? 'C'
                    : null;

          const isDestinationIpClassABC = destinationIpClass !== null;
          const destinationIpInfo = destination_country?.data?.[0];
          const resolvedDestinationCountry =
            destinationIpInfo ??
            (isDestinationIpClassABC && address
              ? {
                  country: address?.country_code ?? 'No IP Info',
                  region: 'No IP Info', // address?.state ?? 'No IP Info',
                  city: address?.city ?? 'No IP Info',
                  ip: ips?.destination_ip,
                }
              : {
                  country: 'No IP Info',
                  region: 'No IP Info',
                  city: 'No IP Info',

                  // country: 'US',
                  // region: 'Virginia',
                  // city: 'Ashburn',

                  ip: ips?.destination_ip,
                });

          return {
            source_ip: ips?.source_ip,
            destination_ip: ips?.destination_ip,
            source_country: resolvedSourceCountry,
            destination_country: resolvedDestinationCountry,
            total_byte: ips?.total_byte,
            timestamp: ips?.timestamp,
          };
        },
        { concurrency: 100 },
      );

      _res = _res.filter(
        (e) =>
          e.source_country?.country &&
          e.source_country.country !== 'No IP Info' &&
          e.destination_country?.country &&
          e.destination_country.country !== 'No IP Info',
      );

      // Asummed only filtering Country
      if (findFilter && Object.keys(findFilter).length) {
        const { filterGroups } = findFilter;
        let [, ...restFilterGroups] = filterGroups;
        // @ts-expect-error - No type yet
        const evaluateBooleanExpression = (tokens) => {
          const ops = {
            // @ts-expect-error - No type yet
            and: { fn: (a, b) => a && b, precedence: 2 },
            // @ts-expect-error - No type yet
            or: { fn: (a, b) => a || b, precedence: 1 },
          };

          // @ts-expect-error - No type yet
          const values = [];
          // @ts-expect-error - No type yet
          const operators = [];

          const applyOp = () => {
            // @ts-expect-error - No type yet
            const b = values.pop();
            // @ts-expect-error - No type yet
            const a = values.pop();
            // @ts-expect-error - No type yet
            const op = operators.pop();
            // @ts-expect-error - No type yet
            values.push(ops[op].fn(a, b));
          };

          for (const token of tokens) {
            if (typeof token === 'boolean') {
              values.push(token);
              // @ts-expect-error - No type yet
            } else if (ops[token]) {
              while (
                operators.length &&
                // @ts-expect-error - No type yet
                ops[operators.at(-1)].precedence >= ops[token].precedence
              ) {
                applyOp();
              }
              operators.push(token);
            } else {
              throw new Error(`Invalid token: ${token}`);
            }
          }

          while (operators.length) applyOp();

          return values[0];
        };
        const _res_filtered = _res.filter((e) => {
          const booleanExpression = restFilterGroups
            // @ts-expect-error - No type yet
            .reduce((acc, curr) => {
              const { filters, groupOperator } = curr;
              // @ts-expect-error - No type yet
              const value = filters.every((f) => {
                return f.values === get(e, f.field);
              });
              return [...acc, value, groupOperator];
            }, [])
            .slice(0, -1);
          return evaluateBooleanExpression(booleanExpression);
        });
        _res = _res_filtered;
      }

      // Return both the processed data and batch information
      return {
        data: _res || [],
        batch_info,
      };
    }),

  // getCountriesSourceIP: privateProcedure.input(z.object({ source_ips: z.any(), time_range: z.array(z.string()), device_id: z.string(), filter_id: z.string(), bucket_size: z.string() })).mutation(async ({ input, ctx }) => {
  //   const { source_ips, time_range, device_id, bucket_size } = input
  //
  //   const ips = await Bluebird.map(source_ips, async (source_ip: string) => {
  //     const res = await ctx.dnaClient.aggregate({
  //       query: {
  //         entity: 'packets',
  //         aggregations: [
  //           {
  //             aggregation: 'SUM',
  //             aggregate_on: 'total_length',
  //             bucket_name: 'bandwidth',
  //           },
  //         ],
  //         advance_filters: [
  //           {
  //             type: 'criteria',
  //             field: 'timestamp',
  //             entity: 'packets',
  //             operator: EOperator.IS_BETWEEN,
  //             values: time_range,
  //           },
  //           {
  //             type: 'operator',
  //             operator: EOperator.AND,
  //           },
  //           {
  //             type: 'criteria' as const,
  //             field: 'source_ip',
  //             entity: 'packets',
  //             operator: EOperator.EQUAL,
  //             values: [
  //               source_ip,
  //             ],
  //           },
  //           {
  //             type: 'operator',
  //             operator: EOperator.AND,
  //           },
  //           {
  //             type: 'criteria',
  //             field: 'device_id',
  //             entity: 'packets',
  //             operator: EOperator.EQUAL,
  //             values: [device_id],
  //           },
  //         ],
  //         joins: [],
  //         bucket_size,
  //         order: {
  //           order_by: 'bucket',
  //           order_direction: EOrderDirection.DESC,
  //         },
  //         // timezone,
  //       },
  //       token: ctx.token.value,

  //     }).execute()

  //     const ip_info = await ctx.dnaClient
  //       .findAll({
  //         entity: 'ip_info',
  //         token: ctx.token.value,
  //         query: {
  //           advance_filters: [
  //             {
  //               type: 'criteria',
  //               field: 'ip',
  //               operator: EOperator.EQUAL,
  //               values: [source_ip],
  //             },
  //           ],
  //           order: {
  //             limit: 10,
  //             by_field: 'ip',
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           pluck: ['country', 'region', 'city', 'ip'],
  //         },
  //       })
  //       .execute()
  //
  //     const flagDetails = await getFlagDetails(ip_info?.data?.[0]?.country)
  //     return { source_ip, result: res?.data, ...ip_info?.data?.[0], ...flagDetails }
  //   }, { concurrency: 100 })

  //
  //   return { data: ips }
  // }),

  saveNetworkTrafficIPs: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        filter_id: z.string(),
        recent_ips: z.array(z.string()).max(10),
        top_ips: z.array(z.string()).max(5),
        recent_ttl: z.number().int().positive(),
        top_ttl: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, filter_id, recent_ips, top_ips, recent_ttl, top_ttl } =
        input;
      await Promise.all([
        ctx.redisClient.cacheData(
          `network_traffic_ips:recent:${device_id}:${filter_id}`,
          recent_ips,
          recent_ttl,
        ),
        ctx.redisClient.cacheData(
          `network_traffic_ips:top:${device_id}:${filter_id}`,
          top_ips,
          top_ttl,
        ),
      ]);
      return { success: true };
    }),

  getNetworkTrafficIPs: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        filter_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { device_id, filter_id } = input;
      const [recentIps, topIps] = await Promise.all([
        ctx.redisClient.getCachedData(
          `network_traffic_ips:recent:${device_id}:${filter_id}`,
        ),
        ctx.redisClient.getCachedData(
          `network_traffic_ips:top:${device_id}:${filter_id}`,
        ),
      ]);
      if (!recentIps || !topIps) return { success: true, data: null };
      if (!Array.isArray(recentIps) || !Array.isArray(topIps))
        return { success: true, data: null };
      return {
        success: true,
        data: {
          recent_ips: recentIps as string[],
          top_ips: topIps as string[],
        },
      };
    }),

  getCountriesSourceIP: privateProcedure
    .input(z.object({ source_ips: z.any(), time_range: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const { source_ips, time_range } = input;
      const _res = await Bluebird.map(
        source_ips,
        async (source_ip: string) => {
          const res = await ctx.dnaClient
            .findAll({
              entity: 'ip_info',
              token: ctx.token.value,
              query: {
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'ip',
                    operator: EOperator.EQUAL,
                    values: [source_ip],
                  },
                  {
                    type: 'operator',
                    operator: EOperator.AND,
                  },
                  {
                    type: 'criteria',
                    field: 'timestamp',
                    operator: EOperator.IS_BETWEEN,
                    values: time_range,
                  },
                ],
                order: {
                  limit: 10,
                  by_field: 'ip',
                  by_direction: EOrderDirection.DESC,
                },
                pluck: ['country', 'region', 'city', 'ip'],
              },
            })
            .execute();

          if (!res?.data?.length) return null;
          return { result: res?.data };
        },
        { concurrency: 100 },
      );
      return _res?.filter(Boolean);
    }),
});

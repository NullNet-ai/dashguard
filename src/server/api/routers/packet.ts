import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
import { EStatus } from '../types';

interface InputData {
  bucket: string;
  bandwidth: string;
}

interface OutputData {
  second: string;
  bandwidth: number;
}



function transformData(data: InputData[]): OutputData[] {
  const result: OutputData[] = [];

  data.forEach((item, index) => {
    // Extract the seconds part from the timestamp
    const seconds = index * 5;
    result.push({
      second:  `${seconds}`,
      bandwidth: parseInt(item.bandwidth, 10),
    });
  });

  // Sort the result by seconds
  // result.sort((a, b) => a.second.localeCompare(b.second));

  return result;
}



export const packetRouter = createTRPCRouter({
  ...createDefineRoutes('packets'),
  // aggregatePackets: privateProcedure.query(async ({ ctx }) => {
  //   const filter = async ({
  //     entity,
  //     pluck,
  //     advance_filters,
  //     limit,
  //   }: {
  //     entity: string
  //     pluck: string[]
  //     advance_filters: IAdvanceFilters<string | number>[]
  //     limit?: number
  //   }) => {
  //     return await ctx.dnaClient
  //       .findAll({
  //         entity,
  //         token: ctx.token.value,
  //         query: {
  //           pluck,
  //           advance_filters: [
  //             {
  //               type: 'criteria',
  //               field: 'timestamp',
  //               entity: 'packets',
  //               operator: EOperator.IS_BETWEEN,
  //               values: [
  //                 '2025-02-05 04:00:00+00',
  //                 '2025-02-05 04:00:20+00',
  //                 '2025-02-05 04:00:40+00',
  //                 '2025-02-05 04:01:00+00',
  //                 '2025-02-05 04:01:20+00',
  //                 '2025-02-05 04:01:40+00',
  //               ],
  //             },
  //           ],
  //           // joins: [],
  //           aggregations: [
  //             {
  //               aggregation: 'count',
  //               aggregate_on: 'id',
  //               bucket_name: 'count',
  //             },
  //           ],
  //           order: {
  //             limit: 100,
  //             by_field: 'bucket',
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           bucket_size: '20s',
  //         },
  //       })
  //       .execute()
  //   }

  // return country_options.data?.map((item) => {
  //   const { id, country } = item;
  //   return {
  //     value: id,
  //     label: country,
  //   };
  // });
  getBandwithPerSecond: privateProcedure.input(z.object({ code: z.string(), bucket_size: z.string(), time_range: z.array(z.string()) })).query(async ({ input, ctx }) => {
    const { code, bucket_size, time_range } = input
    console.log('%c Line:77 🍕 time_range', 'color:#4fff4B', time_range, bucket_size);

    const res = await ctx.dnaClient.aggregate({
      // @ts-ignore
      query: {
        entity: 'packets',
        aggregations: [
          {
            "aggregation": "SUM",
            "aggregate_on": "payload_length",
            "bucket_name": "bandwidth",
        }
        ],
        advance_filters: [
          {
            type: 'criteria',
            field: 'timestamp',
            entity: 'packets',
            operator: EOperator.IS_BETWEEN,
            values: time_range,
          },
          // {
          //   type: 'operator',
          //   operator: EOperator.AND,
          // },
          // {
          //   type: 'criteria',
          //   field: 'device_id',
          //   entity: 'device_heartbeats',
          //   operator: EOperator.EQUAL,
          //   values: [
          //   device_id,
          //   ],
          // },
        ],
        bucket_size,
        order: {
               "order_by": "bucket",
        "order_direction": EOrderDirection.DESC
        },
      },
      token: ctx.token.value,

    }).execute()
    console.log('%c Line:121 🍢 res', 'color:#33a5ff', res);


    // [
    //   { bucket: '2025-02-06 05:14:07+00', bandwidth: '1' },
    //   { bucket: '2025-02-06 05:14:02+00', bandwidth: '5' },
    //   { bucket: '2025-02-06 05:13:57+00', bandwidth: '1' },
    //   { bucket: '2025-02-06 05:13:52+00', bandwidth: '4' },
    //   { bucket: '2025-02-06 05:13:47+00', bandwidth: '9' },
    //   { bucket: '2025-02-06 05:13:42+00', bandwidth: '0' },
    //   { bucket: '2025-02-06 05:13:37+00', bandwidth: '5' },
    //   { bucket: '2025-02-06 05:13:32+00', bandwidth: '9' },
    //   { bucket: '2025-02-06 05:13:27+00', bandwidth: '3' },
    //   { bucket: '2025-02-06 05:13:22+00', bandwidth: '6' },
    //   { bucket: '2025-02-06 05:13:17+00', bandwidth: '1' },
    //   { bucket: '2025-02-06 05:13:12+00', bandwidth: '3' }
    // ]

    // Function to transform the data
    const transformedData: OutputData[] = transformData(res?.data as InputData[]);
    console.log('%c Line:184 🥛 transformedData', 'color:#3f7cff', transformedData);
    
    return transformedData
  }),

  createDynamicRecord: privateProcedure
  .input(
    z.object({
      entity: z.string().min(1),
      data: z.object({}),
    }),
  )
  .mutation(async ({ input, ctx }) => {

    const formatDate = (date:any) => {
      const pad = (num:any, size = 2) => String(num).padStart(size, '0');
    
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
             `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.` +
             `${String(date.getUTCMilliseconds()).padStart(3, '0')}+00`;
    };
    
    const timestamp = formatDate(new Date());
    console.log(timestamp); // Example output: '2025-02-04 04:51:37.134+00'
    
    const sampleData = {
      // code: 'PK449666',
      // tombstone: 0,
      status: 'Active',
      // version: 1,
      // created_date: '2025-02-04',
      // created_time: '04:51',
      // updated_date: '2025-02-04',
      // updated_time: '04:51',
      // organization_id: 'ee1b9a50-51ec-4ecf-bcc2-8f9511f9feb8',
      // created_by: 'a0922bd1-d994-47ab-bf63-2c855b5ea9ab',
       timestamp : new Date().toISOString(),
      // tags: [],
      hypertable_timestamp: '2025-02-04T04:51:37.134Z',
      interface_name: 'vtnet0',
      source_mac: '2c:f0:5d:88:d7:bc',
      destination_mac: '01:00:5e:00:00:fb',
      ether_type: 'unknown',
      ip_header_length: 20,
      payload_length: Math.floor(Math.random() * 10),
      protocol: 'udp',
      source_ip: '172.18.51.11',
      destination_ip: '224.0.0.251',
      source_port: 5353,
      destination_port: 5353,
      entity_prefix: 'PK',
    }

    console.log('%c Line:300 🎂', 'color:#6ec1c2');
    const a =  await ctx.dnaClient
      .create({
        entity: input.entity,
        token: ctx.token.value,
        mutation: {
          params: {
            ...sampleData,
            status: EStatus.ACTIVE,
          },
          pluck: ['id', 'code', 'timestamp'],
        },
      })
      .execute()


      return a
  }),

})

// create an interval that adds data in the packets

// filter from 3 minutes ago include seconds,

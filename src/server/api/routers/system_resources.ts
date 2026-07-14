import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { createRootOrm } from '~/server/lib/root-orm';

const entity = 'system_resources';

export const systemResourcesRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getByDevice: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        time_range: z.tuple([z.string(), z.string()]).optional(),
        limit: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { device_id, time_range, limit = 120 } = input;

      const rootOrm = await createRootOrm(ctx.dnaClient);
      const query = rootOrm.findAll({
        entity,
        query: {
          pluck: [
            'num_cpus',
            'global_cpu_usage',
            'cpu_usage',
            'total_memory',
            'used_memory',
            'total_disk_space',
            'available_disk_space',
            'read_bytes',
            'written_bytes',
            'temperature',
            'timestamp',
          ],
          advance_filters: time_range
            ? [
                {
                  type: 'criteria',
                  field: 'timestamp',
                  entity,
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
                  entity,
                  operator: EOperator.EQUAL,
                  values: [device_id],
                },
              ]
            : [
                {
                  type: 'criteria',
                  field: 'device_id',
                  entity,
                  operator: EOperator.EQUAL,
                  values: [device_id],
                },
              ],
          // Newest rows first so the window tracks "now"; reversed to
          // chronological order below for left→right plotting.
          order: {
            starts_at: 0,
            limit,
            by_field: 'timestamp',
            by_direction: EOrderDirection.DESC,
          },
        },
      });

      const { data } = await query.execute();
      return (data ?? []).slice().reverse();
    }),
});

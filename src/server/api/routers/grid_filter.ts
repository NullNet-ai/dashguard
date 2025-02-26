import { ulid } from 'ulid'
import { createDefineRoutes } from '../baseCrud'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { z } from 'zod';

const ENTITY = 'grid_filter'

const filterCriteriaSchema = z.object({
    operator: z.string(),
    type: z.enum(['criteria', 'operator']),
    field: z.string().optional(),
    label: z.string().optional(),
    values: z.array(z.string()),
    default: z.boolean().optional(),
  });
  
  const sortSchema = z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']),
    label: z.string(),
  });
  
  const groupSchema = z.object({
    field: z.string(),
    label: z.string(),
  });
  
  const columnSchema = z.object({
    header: z.string(),
    accessorKey: z.string(),
    label: z.string(),
    isShow: z.boolean(),
    order: z.number(),
    id: z.string().uuid(),
  });
  
  const gridFilterSchema = z.object({
    name: z.string().min(1),
    default_filter: z.array(filterCriteriaSchema),
    sorts: z.array(sortSchema),
    groups: z.array(groupSchema).optional(),
    columns: z.array(columnSchema),
  });

export const gridFilterRouter = createTRPCRouter({
    ...createDefineRoutes(ENTITY),
    createGridFilter: privateProcedure
    .input(gridFilterSchema)
    .mutation(async ({ ctx, input }) => {
        const token = ctx?.token.value
        const id = ctx?.session?.account?.contact?.id

        const filter_id = ulid();
        
        const { data, message, success, errors } = await ctx.dnaClient
        .create({
            entity: ENTITY,
            token,
            mutation: {
                params: {
                    id: filter_id,
                    name : 'Test Filter',
                    grid_id : '',
                    contact_id: id,
                    link : `/portal/contact/grid?filter_id=${filter_id}`,
                    is_current : true,
                    is_default : true,
                    entity : 'contact',
                    columns : input.columns,
                    groups : input.groups,
                    sorts : input.sorts,
                    advance_filters : input.default_filter,
                },
                pluck: [
                    'id',
                    'name',
                    'grid_id',
                    'link',
                    'is_current',
                    'is_default',
                    'entity',
                    'columns',
                    'groups',
                    'sorts',
                    'advance_filters',
                ],
            },
        }).execute()

        console.error("RESPONSE", {
            data,
            message,
            success,
            errors,
        })

        if (!success) {
            throw new Error(message)
        }
        return data
        
      }),
})

import { EOperator, type EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import Bluebird from 'bluebird'
import { z } from 'zod'

import Notifications from '~/module/notification/notifications.class'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { mockNotifications } from '../mock-data/notification'
import { mockUserRoles } from '../mock-data/user-roles'

const ENTITY = 'notification'

export const notificationsRouter = createTRPCRouter({
  getUnreadNotificationsCountByContact: privateProcedure.query(async ({ ctx }) => {
    const id = ctx?.session?.account?.contact?.id

    if (id) {
      const { total_count } = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            track_total_records: true,
            advance_filters: [
              {
                type: 'criteria',
                field: 'recipient_id',
                operator: EOperator.EQUAL,
                values: [id],
              },
              {
                operator: EOperator.AND,
                type: 'operator',
              },
              {
                type: 'criteria',
                field: 'notification_status',
                operator: EOperator.EQUAL,
                values: ['unread'],
              },
              {
                operator: EOperator.AND,
                type: 'operator',
              },
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: ['Active'],
              },
            ],
          },
        })
        .execute()
      return total_count
    }
  }),

  getAllNotificationsCountByContact: privateProcedure.query(async ({ ctx }) => {
    const id = ctx?.session?.account?.contact?.id

    if (id) {
      const { total_count } = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            track_total_records: true,
            advance_filters: [
              {
                type: 'criteria',
                field: 'recipient_id',
                operator: EOperator.EQUAL,
                values: [id],
              },
              {
                operator: EOperator.AND,
                type: 'operator',
              },
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: ['Active'],
              },
            ],
          },
        })
        .execute()
      return total_count
    }
  }),


  getNotifications: privateProcedure
    .input(
      z.object({
        filters: z.array(
          // any object
          z.object({
            type: z.string(),
            field: z.string().optional(),
            operator: z.nativeEnum(EOperator),
            values: z.array(z.any()).optional(),
            default: z.boolean().optional(),
          }),
        ),
        order: z.object({
          limit: z.number(),
          starts_at: z.number(),
          sortBy: z.string(),
          sortOrder: z.enum(['asc', 'desc']),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = ctx?.session?.account?.contact?.id

      if (id) {
        const filters = [
          {
            type: 'criteria',
            field: 'recipient_id',
            operator: EOperator.EQUAL,
            values: [id],
          },
          ...(input.filters.length > 0
            ? [
                {
                  operator: 'and',
                  type: 'operator',
                  default: true,
                },
                ...input.filters,
              ]
            : []),
        ]

        const { data, total_count } = await ctx.dnaClient
          .findAll({
            entity: ENTITY,
            token: ctx.token.value,
            query: {
              track_total_records: true,
              pluck: [
                'id',
                'title',
                'description',
                'timestamp',
                'link',
                'categories',
                'icon',
                'source',
                'is_pinned',
                'actions',
                'recipient_id',
                'notification_status',
                'priority_label',
                'priority_level',
                'expiry_date',
                'metadata',
              ],
              advance_filters: filters as IAdvanceFilters<string | number>[],
              order: {
                limit: input.order.limit || 50,
                starts_at: input.order.starts_at || 0,
                by_field: input.order.sortBy,
                by_direction: input.order.sortOrder as EOrderDirection,
              },
            },
          })
          .execute()
        return {
          data,
          total_count,
        }
      }
      return {
        data: [],
        total_count: 0,
      }
    }),

  populateDatabase: privateProcedure.mutation(async ({ ctx }) => {
    const token = ctx?.token.value
    const id = ctx?.session?.account?.contact?.id
    for (const notification of mockNotifications) {
      await Notifications.send(
        {
          ...(notification as any),
          recipient_id: id,
        }, token,
      )
    }

    return {
      success: true,
    }
  }),

  handleSingleReadUnread: privateProcedure
    .input(
      z.object({
        id: z.string(),
        notification_status: z.enum(['read', 'unread']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              notification_status: input.notification_status,
            },
          },
        })
        .execute()
      return res
    }),

  handleBatchRead: privateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        notification_status: z.enum(['read', 'unread']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await Bluebird.map(
        input.ids, async (id) => {
          return await ctx.dnaClient
            .update(id, {
              entity: ENTITY,
              token: ctx.token.value,
              mutation: {
                params: {
                  notification_status: input.notification_status,
                },
              },
            })
            .execute()
        }, {
          concurrency: 5,
        },
      )

      return res
    }),

  handlePinNotification: privateProcedure
    .input(
      z.object({
        id: z.string(),
        is_pinned: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              is_pinned: input.is_pinned,
            },
          },
        })
        .execute()
      return res
    }),

  handleChangeStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.status === 'Delete') {
        const res = await ctx.dnaClient
          .delete(input.id, {
            is_permanent: true,
            entity: ENTITY,
            token: ctx.token.value,
            mutation: {
              params: {
                status: input.status,
              },
            },
          })
          .execute()
        return res
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: input.status,
            },
          },
        })
        .execute()
      return res
    }),

  // sendNotification: privateProcedure
  //   .input(zodNotificationSchema)
  //   .mutation(async ({ ctx }) => {
  //     const token = ctx?.token.value;
  //     await Notifications.send(
  //       {
  //         id: ulid(),
  //         title: 'New message',
  //         description: 'You have a new message from a user',
  //         timestamp: new Date().toString(),
  //         link: '#',
  //         categories: ['Test'],
  //         actions: [
  //           {
  //             label: 'Yes',
  //             control: 'button',
  //             value: 'yes',
  //             className: 'bg-green-500',
  //           },
  //           {
  //             label: 'No',
  //             control: 'button',
  //             value: 'no',
  //             className: 'bg-red-500',
  //           },
  //         ],
  //         recipients: ['123'],
  //         notification_status: 'unread',
  //         priority: 'high',
  //         expires_at: '',
  //         is_acknowledged: false,
  //         metadata: {},
  //       },
  //       token,
  //     );

  //     return {
  //       success: true,
  //     };
  //   }),
  handleAction: privateProcedure
    .input(
      z.object({
        actionValue: z.string(),
        actionMetadata: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      await Notifications.handleAction('yes', {
        context: ctx,
        metadata: {
          actionValue: 'yes',
          actionMetadata: 'test',
        },
      })
      return {
        success: true,
      }
    }),
})

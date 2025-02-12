import { ulid } from 'ulid';
import { z } from 'zod';
import Notifications from '~/module/notification/notifications.class';
import { zodNotificationSchema } from '~/module/notification/schema';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
export const notificationsRouter = createTRPCRouter({
  getNotificationsByContact: privateProcedure.query(async () => {
    const notifications = [
      {
        id: ulid(),
        icon: '',
        title: 'New message',
        description: 'You have a new message from a user',
        time: '2m',
        link: '#',
        acknowledged: false,
      },
      {
        id: ulid(),
        icon: '',
        title: 'New message',
        description: 'You have a new message from a user',
        time: '5m',
        link: '#',
        acknowledged: false,
      },
      {
        id: ulid(),
        icon: '',
        title: 'New message',
        description: 'You have a new message from a user',
        time: '10m',
        link: '#',
        acknowledged: false,
      },
    ];
    return notifications;
  }),
  sendNotification: privateProcedure
    .input(zodNotificationSchema)
    .mutation(async ({ ctx }) => {
      const token = ctx?.token.value;
      await Notifications.send(
        {
          id: ulid(),
          title: 'New message',
          description: 'You have a new message from a user',
          timestamp: new Date().toString(),
          link: '#',
          categories: ['Test'],
          actions: [
            {
              label: 'Yes',
              control: 'button',
              value: 'yes',
              className: 'bg-green-500',
            },
            {
              label: 'No',
              control: 'button',
              value: 'no',
              className: 'bg-red-500',
            },
          ],
          recipients: ['123'],
          status : 'unread',
          priority: 'high',
          expires_at: '',
          is_acknowledged: false,
          metadata: {
            
          },
        },
        token,
      );

      return {
        success: true,
      };
    }),
  handleAction: privateProcedure
    .input(
      z.object({
        actionValue: z.string(),
        actionMetadata: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      Notifications.handleAction('yes', {
        context: ctx,
        metadata: {
          actionValue: 'yes',
          actionMetadata: 'test',
        },
      });
      return {
        success: true,
      };
    }),
});

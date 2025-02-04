import 'dotenv/config';
import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm';
import { zodNotificationSchema } from './schema';
import { TNotificationSchema } from './types';

export const notification_container = new Map();
export default class Notifications {
  static async setActions(map: Map<string, () => Promise<void>>) {
    return [];
  }

  static async handleAction(
    action: string,
    {
      context,
      metadata,
    }: {
      context: any;
      metadata: any;
    },
  ) {
    const actionHandler = notification_container.get(action);
    if (actionHandler) {
      await actionHandler(context, metadata);
    }
  }

  static parametersValidator(notification: TNotificationSchema) {
    return zodNotificationSchema.safeParse(notification);
  }

  static async send(notification: TNotificationSchema, token: string) {
    const validation = Notifications.parametersValidator(notification);
    if (!validation.success) {
      throw new Error('Invalid notification');
    }
    if (!token) {
      throw new Error('No token provided');
    }

    const dnaClient = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    });

    await dnaClient
      .create({
        entity: 'notification',
        token: token,
        mutation: {
          params: {
            notification,
          },
        },
      })
      .execute();
    console.info('[Notification]: Notification sent');
    return notification;
  }
}

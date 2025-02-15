import 'dotenv/config';
import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm';
import { zodNotificationSchema } from './schema';
import { TNotificationSchema } from './types';

export const notification_container = new Map();
export default class Notifications {
  static async setActions(map: Map<string, (context: any, metadata: any) => Promise<void>>) {
    for (const [key, handler] of map.entries()) {
      notification_container.set(key, handler);
    }
  }

  static async handleAction(
    action: string,
    { context, metadata }: { context: any; metadata: any }
  ) {
    const actionHandler = notification_container.get(action);
    if (!actionHandler) {
      console.warn(`No handler found for action: ${action}`);
      return;
    }
  
    try {
      await actionHandler(context, metadata);
    } catch (error) {
      console.error(`Error executing action ${action}:`, error);
    }
  }
  

  static parametersValidator(notification: TNotificationSchema) {
    return zodNotificationSchema.safeParse(notification);
  }

  static async send(notification: TNotificationSchema, token: string) {

    const validation = Notifications.parametersValidator(notification);
    if (!validation.success) {
      throw new Error(
        `Invalid notification: ${JSON.stringify(validation.error.format())}`,
      );
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
              ...notification,
              metadata: JSON.stringify(notification.metadata),
              status: notification.status || 'unread', // Default to unread
          },
        },
      })
      .execute();
      
      console.info(`[Notification]: Notification sent successfully`);
      return notification;
  }

  static async getNotifications(token: string) {
    if (!token) throw new Error('Token is required');
  
    const dnaClient = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    });
  
    const notifications = await dnaClient.findAll({
      entity: 'notification',
      token,
      query: {
        pluck: [
          'id',
          'title',
          'description',
          'timestamp',
          'link',
          'categories',
          'actions',
          'recipients',
          'status',
          'priority',
        ],
        track_total_records: true,
        advance_filters: [],
      },
    })
      .execute();

    if (!notifications) {
      return [];
    }      
    console.table(notifications);
  
    return notifications;
  }
  
}

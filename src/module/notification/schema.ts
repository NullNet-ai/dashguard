import { z } from 'zod';

export const zodNotificationSchema = z.object({
  id: z.string().ulid(),
  title: z.string().min(1),
  description: z.string().min(1),
  timestamp: z.string(),
  link: z.string().optional(),
  categories: z.array(z.string()).optional(),
  icon: z.string().optional(),  // New: For different notification types
  source: z.string().optional(),  // New: Source of notification (e.g., "Day Data", "System", etc.)
  is_pinned: z.boolean().default(false),
  actions: z.array(
    z.object({
      label: z.string().min(1),
      control: z.enum(['button', 'link', 'input']),
      value: z.string().optional(),
      className: z.string().optional(),
    })
  ).optional(),
  recipient_id: z.string(),
  notification_status: z.enum(['unread', 'read', 'dismissed']).default('unread'),
  priority_label: z.enum(['low', 'medium', 'high']).default('low'),
  priority_level: z.number().default(0),
  expiry_date: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

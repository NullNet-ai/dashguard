import { z } from 'zod';

export const zodNotificationSchema = z.object({
  id: z.string().ulid(),
  title: z.string().min(1).max(255),
  subtitle: z.string().optional(),  // New: Support for subtitles
  description: z.string().min(1),
  timestamp: z.date(),
  link: z.string().url().optional(),
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
  recipients: z.array(z.string().uuid()),
  status: z.enum(['unread', 'read', 'dismissed']).default('unread'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  expires_at: z.date().optional(),
  is_acknowledged: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

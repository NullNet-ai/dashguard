import { z } from 'zod';

export const zodNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  link: z.string(),
  categories: z.array(z.string()),
  actions: z.array(
    z.object({
      label: z.string(),
      control: z.enum(['button', 'link', 'input']),
      value: z.string(),
      className: z.string().optional(),
    }),
  ),
  contact_id: z.string(),
  acknowledged: z.boolean(),
  metadata: z.string(),
});

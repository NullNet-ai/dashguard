import { z } from "zod";

export const ContactDeviceGroupDetailsSchema = z.object({
  device_groups: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ).optional()
});

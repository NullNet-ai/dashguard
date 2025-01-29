import { z } from "zod";

export const DeviceBasicDetailsSchema = z.object({
  model: z
    .string({
      message: "Model is required.",
    })
    .min(1, {
      message: "Model is required.",
    }),
  grouping: z.string().optional().nullable(),
  instance_name: z
    .string({
      message: "Instance Name is required.",
    })
    .min(1, {
      message: "Instance Name is required.",
    }),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
});

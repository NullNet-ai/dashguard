import { z } from "zod";

export const scheduleSchema = z.object({
  title: z.string().nullable().optional(),
  start_time: z
    .string({ message: "Start time is required" })
    .min(1, { message: "Start time is required" }),
  start_date: z
    .string({ message: "Start date is required" })
    .min(1, { message: "Start date is required" }),
  duration_mins: z
    .string({ message: "Duration is required" })
    .min(1, { message: "Duration is required" }),
  timezone: z.string().nullable().optional(),
  reminder: z.string().nullable().optional(),
  interview_location: z.string().nullable().optional(),
});

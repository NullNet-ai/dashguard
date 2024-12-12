import { z } from "zod";

export const BookingFeedbackSchema = z.object({});

export type TBookingFeedbackSchema = z.infer<typeof BookingFeedbackSchema>;

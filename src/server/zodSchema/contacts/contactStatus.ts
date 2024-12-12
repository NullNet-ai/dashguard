import { z } from "zod";

export const ContactStatusSchema = z.object({
  contact_status: z
    .string({
      message: "Contact Status is required.",
    })
    .min(1, {
      message: "Contact Status is required.",
    }),
});

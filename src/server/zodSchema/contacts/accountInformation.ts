import { z } from "zod";

const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

export const AccountInformationSchema = z.object({
  contact_id: z.string(),
  password: z
    .string({ message: "Password must be a string." })
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters long." })
    .refine((value) => specialCharRegex.test(value), {
      message: "Password must include at least one special character.",
    }),
  email: z.string().min(1).email(),
});

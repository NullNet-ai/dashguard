import { z } from "zod";

export const UserRoleFormSchema = z.object({
  role: z
    .string({ message: "Role is required." })
    .min(1, { message: "Role is required." }),
});

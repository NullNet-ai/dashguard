import { z } from "zod";

const ZodAdvanceFilter = z
  .array(
    z
      .object({
        id: z.string().optional(),
        type: z.enum(["criteria", "operator"]),
        field: z.string().optional(),
        operator: z.string().optional(),
        values: z.array(z.string()).optional(),
      })
      .refine(
        (data) =>
          (data.type === "criteria" &&
            data.field &&
            data.operator &&
            data.values &&
            data.id) ||
          (data.type === "operator" && data.operator),
        {
          message: "Invalid filter configuration",
          path: ["filters"],
        },
      ),
  )
  .optional();

export default ZodAdvanceFilter;

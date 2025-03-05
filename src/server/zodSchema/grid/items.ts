import { z } from "zod";
import Entities from "~/auto-generated/entities";

const ZodItems = z.object({
  entity: z.string().refine(
    (value) => {
      
      return Entities.includes(value);
    },
    {
      message: "Invalid entity name. It must be one of the DnaOrm models.",
    },
  ), // Optional entity filter if needed
  limit: z.number().min(1).optional(), // Limit of items per page
  current: z.number().optional(), // Current page number
  pluck: z.any().optional(), // Optional fields to pluck
  pluck_object: z.any().optional(), // Optional fields to pluck
  advance_filters: z
    .array(
      z.object({
        type: z.string(),
        field: z.string().optional(),
        entity: z.string().optional(),
        operator: z.string(),
        values: z.array(z.string()).optional(),
      }),
    )
    .optional(), // Optional advance filters
  sorting: z
    .array(
      z.object({
        id: z.string(),
        desc: z.boolean(),
        sort_key: z.string().optional(),
      }),
    )
    .optional(), // Optional sorting
    is_case_sensitive_sorting: z.string().optional(), // Optional sorting
});

export default ZodItems;

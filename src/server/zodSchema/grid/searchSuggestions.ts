import { z } from 'zod';
import Entities from '~/auto-generated/entities';

const ZodSearchSuggestions = z.object({
  entity: z.string().refine(
    (value) => {
      return Entities.includes(value);
    },
    {
      message: 'Invalid entity name. It must be one of the DnaOrm models.',
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
        values: z.array(z.any()).optional(),
        parse_as: z.string().optional(),
        is_search: z.boolean().optional(),
      }),
    )
    .optional(), // Optional advance filters
  sorting: z
    .array(
      z.object({
        id: z.string(),
        desc: z.boolean(),
        sort_key: z.string().optional(),
        is_case_sensitive_sorting: z.boolean().optional(),
      }),
    )
    .optional(), // Optional sorting
  group_advance_filters: z
    .array(
      z.object({
        type: z.string(),
        filters: z.array(z.any()).optional(),
        field: z.string().optional(),
        entity: z.string().optional(),
        operator: z.string().or(z.any()).optional(),
        values: z.array(z.string()).optional(),
      }),
    )
    .optional(), // Optional group advance filters
  grouping: z.array(z.string()).optional(), // Optional groupings
  searchable_fields: z.array(z.any()).optional(),
});

export default ZodSearchSuggestions;

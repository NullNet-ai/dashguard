import { z } from 'zod';

export const FilterCriteriaSchema = z.object({
  field: z.string(),
  operator: z.string(),
  label: z.string(),
  values: z.union([z.string(), z.array(z.string()), z.undefined()]),
  type: z.literal('criteria'),
  default: z.boolean(),
});

export const FilterOperatorSchema = z.object({
  operator: z.enum(['and', 'or']),
  type: z.literal('operator'),
  default: z.boolean(),
});

export const FilterItemSchema = z.discriminatedUnion('type', [
  FilterCriteriaSchema,
  FilterOperatorSchema,
]);

export const ZodSchema = z.object({
  filterGroups: z.array(
    z.object({
      id: z.string(),
      groupOperator: z.enum(['and', 'or']).default('and'),
      filters: z.array(FilterItemSchema),
    }),
  ),
});
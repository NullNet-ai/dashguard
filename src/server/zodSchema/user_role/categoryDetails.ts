import { z } from 'zod';

const RoleCategoryDetailsSchema = z.object({
  categories: z.string().min(1, {
    message: 'Please select a category',
  }),
  entity: z.string().min(1, {
    message: 'Please select an entity',
  }),
});

export default RoleCategoryDetailsSchema;

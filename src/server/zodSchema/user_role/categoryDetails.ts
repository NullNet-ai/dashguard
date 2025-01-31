import { z } from 'zod'

const RoleCategoryDetailsSchema = z.object({
  categories: z
    .string()
    .min(1, { message: 'Category is required' }),
  entity: z
    .string()
    .min(1, { message: 'Entity is required' }),
})

export default RoleCategoryDetailsSchema

import { z } from 'zod'

const RoleCategoryDetailsSchema = z.object({
  categories: z
    .string({ message: 'Category is required' })
    .min(1, { message: 'Category is required' }),
  entity: z
    .string({ message: 'Entity is required' })
    .min(1, { message: 'Entity is required' }),
})

export default RoleCategoryDetailsSchema

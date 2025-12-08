import { z } from 'zod'

export const FormSchema = z.object({
  radio: z
    .string({ message: 'Radio is required' })
    .min(1, { message: 'Radio is required' }),
  radio_other_input: z.string().optional(),
})

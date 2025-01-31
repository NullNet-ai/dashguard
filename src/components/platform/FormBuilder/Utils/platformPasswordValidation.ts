import { z } from 'zod'

export const platformPasswordValidator = (value: string, ctx: any) => {
  const errors: string[] = []

  // Check for minimum length
  if (value.length < 12) {
    errors.push('Password must be at least 12 characters long.')
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(value)) {
    errors.push('Password must contain at least one uppercase letter.')
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(value)) {
    errors.push('Password must contain at least one lowercase letter.')
  }

  // Check for number
  if (!/[0-9]/.test(value)) {
    errors.push('Password must contain at least one number.')
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errors.push('Password must contain at least one special character.')
  }

  // If there are errors, add them to the context
  if (errors.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: errors.join(' '),
    })
  }
}

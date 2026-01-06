import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Nieprawidłowy email'),
  password: z.string().min(8, 'Minimum 8 znaków'),
})

export const registerSchema = loginSchema

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

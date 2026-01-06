import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string().min(3, 'Minimum 3 znaki').max(255),
  imageId: z.number().optional(),
})

export type TodoFormData = z.infer<typeof todoSchema>

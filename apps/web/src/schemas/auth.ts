import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export type LoginValues = z.infer<typeof loginSchema>

import { z } from 'zod'

export const staffSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid').max(150),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(255).optional(),
  role: z.enum(['librarian', 'head']),
  is_active: z.boolean(),
})

export type StaffFormValues = z.infer<typeof staffSchema>

/** Convert validated form values into the API payload (no blanks). */
export function toStaffPayload(values: StaffFormValues) {
  const clean = (v?: string) => (v && v.trim() !== '' ? v.trim() : undefined)
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: clean(values.phone),
    address: clean(values.address),
    role: values.role,
    is_active: values.is_active,
  }
}

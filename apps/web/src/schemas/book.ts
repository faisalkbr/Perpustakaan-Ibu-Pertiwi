import { z } from 'zod'

const currentYear = new Date().getFullYear()

/**
 * Form-level schema: every field is a string (what the inputs produce), so the
 * Zod input and output types match and play nicely with react-hook-form.
 * Conversion to the API payload happens in the submit handler.
 */
export const bookSchema = z.object({
  title: z.string().trim().min(2, 'Judul minimal 2 karakter').max(150),
  author: z.string().trim().min(2, 'Pengarang minimal 2 karakter').max(100),
  publisher: z.string().trim().max(120).optional(),
  isbn: z.string().trim().max(20).optional(),
  category: z.string().trim().max(60).optional(),
  published_year: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (/^\d{4}$/.test(v) && +v >= 1450 && +v <= currentYear + 1),
      'Tahun terbit tidak valid',
    ),
  stock: z
    .string()
    .min(1, 'Stok wajib diisi')
    .refine((v) => /^\d+$/.test(v), 'Stok harus berupa angka'),
  description: z.string().trim().max(2000).optional(),
})

export type BookFormValues = z.infer<typeof bookSchema>

/** Convert validated form values into the API payload (numbers, no blanks). */
export function toBookPayload(values: BookFormValues) {
  const clean = (v?: string) => (v && v.trim() !== '' ? v.trim() : undefined)
  return {
    title: values.title.trim(),
    author: values.author.trim(),
    publisher: clean(values.publisher),
    isbn: clean(values.isbn),
    category: clean(values.category),
    published_year: values.published_year ? Number(values.published_year) : undefined,
    stock: Number(values.stock),
    description: clean(values.description),
  }
}

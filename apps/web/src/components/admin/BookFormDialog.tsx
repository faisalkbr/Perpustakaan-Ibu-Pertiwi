import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { bookSchema, toBookPayload, type BookFormValues } from '@/schemas/book'
import { useCreateBook, useUpdateBook } from '@/hooks/useBookMutations'
import { ApiError } from '@/lib/api'
import type { Book } from '@/types'

const EMPTY: BookFormValues = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  category: '',
  published_year: '',
  stock: '0',
  description: '',
  cover_url: '',
}

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  book: Book | null
}) {
  const isEdit = Boolean(book)
  const create = useCreateBook()
  const update = useUpdateBook()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BookFormValues>({ resolver: zodResolver(bookSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      book
        ? {
            title: book.title,
            author: book.author,
            publisher: book.publisher ?? '',
            isbn: book.isbn ?? '',
            category: book.category ?? '',
            published_year: book.published_year != null ? String(book.published_year) : '',
            stock: String(book.stock),
            description: book.description ?? '',
            cover_url: book.cover_url ?? '',
          }
        : EMPTY,
    )
  }, [open, book, reset])

  const onSubmit = (values: BookFormValues) => {
    const onError = (err: unknown) => {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([k, m]) =>
          setError(k as keyof BookFormValues, { message: m }),
        )
      }
    }
    const onSuccess = () => onOpenChange(false)
    const payload = toBookPayload(values)
    if (isEdit && book) update.mutate({ id: book.id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Buku' : 'Tambah Buku'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4" noValidate>
          <Field label="Judul" error={errors.title?.message} className="col-span-2">
            <Input placeholder="Judul buku" {...register('title')} />
          </Field>
          <Field label="ISBN" error={errors.isbn?.message}>
            <Input placeholder="978-..." {...register('isbn')} />
          </Field>
          <Field label="Pengarang" error={errors.author?.message}>
            <Input placeholder="Nama pengarang" {...register('author')} />
          </Field>
          <Field label="Penerbit" error={errors.publisher?.message}>
            <Input placeholder="Nama penerbit" {...register('publisher')} />
          </Field>
          <Field label="Kategori" error={errors.category?.message}>
            <Input placeholder="mis. Sastra" {...register('category')} />
          </Field>
          <Field label="Tahun Terbit" error={errors.published_year?.message}>
            <Input type="number" placeholder="2020" {...register('published_year')} />
          </Field>
          <Field label="Stok" error={errors.stock?.message}>
            <Input type="number" {...register('stock')} />
          </Field>
          <Field label="URL Sampul" error={errors.cover_url?.message} className="col-span-2">
            <Input placeholder="https://… (opsional)" {...register('cover_url')} />
          </Field>
          <Field label="Deskripsi" error={errors.description?.message} className="col-span-2">
            <Textarea placeholder="Ringkasan buku (opsional)" {...register('description')} />
          </Field>

          <DialogFooter className="col-span-2 mt-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

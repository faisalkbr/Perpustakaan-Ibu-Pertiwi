import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { booksApi, type BookPayload } from '@/services/books'
import { queryKeys } from '@/lib/queryKeys'

export function useCreateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookPayload) => booksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.books.all })
      toast.success('Buku ditambahkan')
    },
  })
}

export function useUpdateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BookPayload> }) =>
      booksApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.books.all })
      toast.success('Buku diperbarui')
    },
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => booksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.books.all })
      toast.success('Buku dihapus')
    },
  })
}

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { booksApi } from '@/services/books'
import { queryKeys, type BookListParams } from '@/lib/queryKeys'

export function useBooks(params: BookListParams) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => booksApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.books.detail(id ?? ''),
    queryFn: () => booksApi.get(id!),
    enabled: Boolean(id),
  })
}

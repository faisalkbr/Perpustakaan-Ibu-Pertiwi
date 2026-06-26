import { apiFetch } from '@/lib/api'
import type { BookListParams } from '@/lib/queryKeys'
import type { Book, Paginated } from '@/types'

function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const booksApi = {
  list: (params: BookListParams) =>
    apiFetch<Paginated<Book>>(`/books${buildQuery(params as Record<string, unknown>)}`),
  get: (id: string | number) => apiFetch<{ data: Book }>(`/books/${id}`),
}

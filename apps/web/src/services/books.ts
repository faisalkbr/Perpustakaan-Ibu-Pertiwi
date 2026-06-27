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

export interface BookPayload {
  title: string
  author: string
  publisher?: string
  isbn?: string
  category?: string
  published_year?: number
  stock: number
  description?: string
  cover_url?: string
}

export const booksApi = {
  list: (params: BookListParams) =>
    apiFetch<Paginated<Book>>(`/books${buildQuery(params as Record<string, unknown>)}`),
  get: (id: string | number) => apiFetch<{ data: Book }>(`/books/${id}`),
  create: (payload: BookPayload) => apiFetch<{ data: Book }>('/books', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<BookPayload>) =>
    apiFetch<{ data: Book }>(`/books/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiFetch<null>(`/books/${id}`, { method: 'DELETE' }),
}

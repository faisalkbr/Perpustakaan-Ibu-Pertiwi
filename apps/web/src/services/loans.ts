import { apiFetch } from '@/lib/api'
import type { LoanListParams } from '@/lib/queryKeys'
import type { Loan, Paginated } from '@/types'

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

export const loansApi = {
  list: (params: LoanListParams) =>
    apiFetch<Paginated<Loan>>(`/loans${buildQuery(params as Record<string, unknown>)}`),
  create: (bookId: number) =>
    apiFetch<{ data: Loan }>('/loans', { method: 'POST', body: { book_id: bookId } }),
}

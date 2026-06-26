import { apiFetch } from '@/lib/api'
import type { Loan, LoanStatus, Paginated } from '@/types'

export const librarianLoansApi = {
  list: (status?: LoanStatus) =>
    apiFetch<Paginated<Loan>>(`/librarian/loans${status ? `?status=${status}` : ''}`),
  counts: () => apiFetch<{ data: { pending: number; active: number } }>('/librarian/loans/counts'),
  approve: (id: number) =>
    apiFetch<{ data: Loan }>(`/librarian/loans/${id}/approve`, { method: 'POST' }),
  reject: (id: number) =>
    apiFetch<{ data: Loan }>(`/librarian/loans/${id}/reject`, { method: 'POST' }),
  returnBook: (id: number) =>
    apiFetch<{ data: Loan }>(`/librarian/loans/${id}/return`, { method: 'POST' }),
}

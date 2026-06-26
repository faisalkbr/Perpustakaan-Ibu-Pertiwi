export interface BookListParams {
  search?: string
  category?: string
  sort_by?: string
  sort_order?: string
  page?: number
  per_page?: number
}

export interface LoanListParams {
  group?: 'aktif' | 'selesai'
}

/** Central factory for all TanStack Query keys. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  books: {
    all: ['books'] as const,
    list: (params: BookListParams) => ['books', 'list', params] as const,
    detail: (id: string | number) => ['books', 'detail', String(id)] as const,
  },
  loans: {
    all: ['loans'] as const,
    list: (params: LoanListParams) => ['loans', 'list', params] as const,
  },
  members: {
    all: ['members'] as const,
    list: (params: Record<string, unknown>) => ['members', 'list', params] as const,
  },
  librarianLoans: {
    all: ['librarian-loans'] as const,
    list: (status?: string) => ['librarian-loans', 'list', status ?? 'all'] as const,
    counts: ['librarian-loans', 'counts'] as const,
  },
  categories: ['categories'] as const,
}

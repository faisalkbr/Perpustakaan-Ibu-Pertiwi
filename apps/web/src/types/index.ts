export type Role = 'member' | 'librarian' | 'head'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Book {
  id: number
  title: string
  author: string
  publisher: string | null
  isbn: string | null
  category: string | null
  published_year: number | null
  stock: number
  available_copies: number
  is_available: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface Member {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  is_active: boolean
  active_loans_count?: number
  created_at: string
}

export interface Staff {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  role: Extract<Role, 'librarian' | 'head'>
  is_active: boolean
  created_at: string
}

export type ReportType = 'peminjaman' | 'denda' | 'koleksi'

export interface ReportTransactionLoan {
  id: number
  member: string
  book: string
  status: LoanStatus
  display_status: LoanDisplayStatus
  borrowed_at: string | null
  returned_at: string | null
  fine: number
  created_at: string | null
}

export interface ReportTransactionBook {
  id: number
  title: string
  author: string
  category: string | null
  stock: number
  loan_count: number
}

export interface ReportSummary {
  type: ReportType
  period: { start: string; end: string }
  totals: {
    loans: number
    fines: number
    active: number
    returned: number
    members: number
    books: number
  }
  top_book: { title: string; count: number } | null
  trend: Array<{ label: string; value: number }>
  transactions: ReportTransactionLoan[] | ReportTransactionBook[]
}

export type LoanStatus = 'pending' | 'active' | 'returned' | 'rejected'
export type LoanDisplayStatus = LoanStatus | 'late'

export interface Loan {
  id: number
  status: LoanStatus
  display_status: LoanDisplayStatus
  borrowed_at: string | null
  due_date: string | null
  returned_at: string | null
  fine: number
  days_remaining: number | null
  book?: Book
  member?: { id: number; name: string; email: string }
  created_at: string
}

/** Laravel paginated resource collection. */
export interface Paginated<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface AuthResponse {
  user: User
  token: string
}

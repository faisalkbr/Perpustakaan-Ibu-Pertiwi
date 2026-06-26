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

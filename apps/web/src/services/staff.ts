import { apiFetch } from '@/lib/api'
import type { Paginated, Role, Staff } from '@/types'

function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface StaffListParams {
  search?: string
  role?: Extract<Role, 'librarian' | 'head'>
  status?: 'active' | 'inactive'
  page?: number
}

export interface StaffPayload {
  name: string
  email: string
  phone?: string
  address?: string
  role: Extract<Role, 'librarian' | 'head'>
  is_active?: boolean
}

export const staffApi = {
  list: (params: StaffListParams) =>
    apiFetch<Paginated<Staff>>(`/staff${buildQuery(params as Record<string, unknown>)}`),
  create: (payload: StaffPayload) =>
    apiFetch<{ data: Staff }>('/staff', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<StaffPayload>) =>
    apiFetch<{ data: Staff }>(`/staff/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiFetch<null>(`/staff/${id}`, { method: 'DELETE' }),
}

import { apiFetch } from '@/lib/api'
import type { Member, Paginated } from '@/types'

function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface MemberListParams {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
}

export interface MemberPayload {
  name: string
  email: string
  phone?: string
  address?: string
  is_active?: boolean
}

export const membersApi = {
  list: (params: MemberListParams) =>
    apiFetch<Paginated<Member>>(`/members${buildQuery(params as Record<string, unknown>)}`),
  create: (payload: MemberPayload) =>
    apiFetch<{ data: Member }>('/members', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<MemberPayload>) =>
    apiFetch<{ data: Member }>(`/members/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiFetch<null>(`/members/${id}`, { method: 'DELETE' }),
}

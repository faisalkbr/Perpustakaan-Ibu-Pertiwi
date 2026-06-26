import { apiFetch } from '@/lib/api'
import type { AuthResponse, User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: payload }),
  me: () => apiFetch<{ user: User }>('/auth/me'),
  logout: () => apiFetch<null>('/auth/logout', { method: 'POST' }),
}

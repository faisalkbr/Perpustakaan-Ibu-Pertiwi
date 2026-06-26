import { useAuthStore } from '@/store/useAuthStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

interface LaravelError {
  message?: string
  errors?: Record<string, string[]>
}

/** Error thrown for any non-2xx API response. Carries status + parsed body. */
export class ApiError extends Error {
  status: number
  data: LaravelError | null

  constructor(message: string, status: number, data: LaravelError | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  /** Flatten Laravel `{ errors: { field: [msg] } }` into `{ field: msg }`. */
  get fieldErrors(): Record<string, string> {
    const errors = this.data?.errors
    if (!errors) return {}
    return Object.fromEntries(
      Object.entries(errors).map(([key, messages]) => [key, messages[0] ?? '']),
    )
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * The single HTTP utility. Adds the bearer token, parses JSON, throws ApiError
 * on failure, and auto-logs-out on 401 (except the login endpoint).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, signal } = options
  const token = useAuthStore.getState().token

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && !path.startsWith('/auth/login')) {
    useAuthStore.getState().logout()
  }

  if (response.status === 204) return null as T

  const data = (await response.json().catch(() => null)) as (T & LaravelError) | null

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return data as T
}

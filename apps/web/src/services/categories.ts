import { apiFetch } from '@/lib/api'

export const categoriesApi = {
  list: () => apiFetch<{ data: string[] }>('/categories'),
}

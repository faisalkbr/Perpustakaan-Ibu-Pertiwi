import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/services/categories'
import { queryKeys } from '@/lib/queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60_000,
  })
}

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { reportsApi, type ReportParams } from '@/services/reports'
import { queryKeys } from '@/lib/queryKeys'

export function useReportSummary(params: ReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.summary(params as Record<string, unknown>),
    queryFn: () => reportsApi.summary(params),
    placeholderData: keepPreviousData,
  })
}

import { apiFetch } from '@/lib/api'
import type { ReportSummary, ReportType } from '@/types'

function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface ReportParams {
  type?: ReportType
  start?: string
  end?: string
}

export const reportsApi = {
  summary: (params: ReportParams) =>
    apiFetch<{ data: ReportSummary }>(
      `/reports/summary${buildQuery(params as Record<string, unknown>)}`,
    ),
}

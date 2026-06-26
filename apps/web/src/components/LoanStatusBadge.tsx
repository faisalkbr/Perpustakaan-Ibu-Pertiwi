import { Badge } from '@/components/ui/badge'
import { LOAN_STATUS_META } from '@/lib/format'
import type { LoanDisplayStatus } from '@/types'

export function LoanStatusBadge({ status }: { status: LoanDisplayStatus }) {
  const meta = LOAN_STATUS_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

import type { LoanDisplayStatus } from '@/types'

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** "2026-06-22" -> "22 Jun 2026". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFmt.format(date)
}

/** 5000 -> "Rp 5.000". */
export function formatRupiah(value: number | null | undefined): string {
  return `Rp ${(value ?? 0).toLocaleString('id-ID')}`
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

type BadgeVariant = 'ok' | 'warn' | 'bad' | 'default'

export const LOAN_STATUS_META: Record<
  LoanDisplayStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Menunggu', variant: 'warn' },
  active: { label: 'Dipinjam', variant: 'warn' },
  returned: { label: 'Dikembalikan', variant: 'ok' },
  late: { label: 'Terlambat', variant: 'bad' },
  rejected: { label: 'Ditolak', variant: 'bad' },
}

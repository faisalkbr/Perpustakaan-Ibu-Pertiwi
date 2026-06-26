import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { LoanStatusBadge } from '@/components/LoanStatusBadge'
import { useLoans } from '@/hooks/useLoans'
import { formatDate, formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Loan } from '@/types'
import type { LoanListParams } from '@/lib/queryKeys'

const TABS: { value: string; label: string; group?: LoanListParams['group'] }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'aktif', label: 'Aktif', group: 'aktif' },
  { value: 'selesai', label: 'Selesai', group: 'selesai' },
]

function remainingLabel(loan: Loan): { text: string; tone: string } {
  if (loan.days_remaining == null) return { text: '—', tone: 'text-foreground' }
  if (loan.days_remaining < 0)
    return { text: `Terlambat ${Math.abs(loan.days_remaining)} hari`, tone: 'text-[var(--bad)]' }
  if (loan.days_remaining === 0) return { text: 'Jatuh tempo hari ini', tone: 'text-[var(--warn)]' }
  return { text: `${loan.days_remaining} hari lagi`, tone: 'text-[var(--warn)]' }
}

function LoanDetail({ loan }: { loan: Loan }) {
  const remaining = remainingLabel(loan)
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-3 bg-[#f7f8fa] px-5 py-4 sm:px-6">
      <div>
        <div className="mb-0.5 text-xs font-medium text-muted-foreground">Tanggal Dikembalikan</div>
        <div className="text-sm font-medium text-foreground">{formatDate(loan.returned_at)}</div>
      </div>
      <div>
        <div className="mb-0.5 text-xs font-medium text-muted-foreground">Denda</div>
        <div className="text-sm font-medium text-foreground">{formatRupiah(loan.fine)}</div>
      </div>
      <div>
        <div className="mb-0.5 text-xs font-medium text-muted-foreground">Sisa Waktu</div>
        <div className={cn('text-sm font-semibold', remaining.tone)}>{remaining.text}</div>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [tab, setTab] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const group = TABS.find((t) => t.value === tab)?.group
  const { data, isLoading, isError } = useLoans({ group })
  const loans = data?.data ?? []

  const toggle = (id: number) => setExpanded((cur) => (cur === id ? null : id))

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-4 text-[30px] leading-tight font-semibold text-ink">Riwayat Peminjaman</h1>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-destructive">
          Gagal memuat riwayat.
        </div>
      ) : isLoading ? (
        <div className="space-y-2 rounded-lg border border-border bg-card p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="font-serif text-lg text-foreground">Belum ada peminjaman</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Riwayat peminjaman Anda akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Desktop table header */}
          <div className="hidden grid-cols-[2.4fr_1.2fr_1.2fr_1fr_40px] items-center gap-2 border-b border-border bg-[#f5f6f8] px-6 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
            <span>Judul Buku</span>
            <span>Tanggal Pinjam</span>
            <span>Jatuh Tempo</span>
            <span>Status</span>
            <span />
          </div>

          {loans.map((loan) => {
            const isOpen = expanded === loan.id
            return (
              <div key={loan.id} className="border-b border-[#eef0f3] last:border-0">
                {/* Desktop row */}
                <button
                  onClick={() => toggle(loan.id)}
                  className="hidden w-full cursor-pointer grid-cols-[2.4fr_1.2fr_1.2fr_1fr_40px] items-center gap-2 px-6 py-4 text-left transition-colors hover:bg-black/[0.015] md:grid"
                >
                  <span className="font-serif text-[15px] font-semibold text-ink">
                    {loan.book?.title}
                  </span>
                  <span className="text-sm text-[#55504a]">{formatDate(loan.borrowed_at)}</span>
                  <span className="text-sm text-[#55504a]">{formatDate(loan.due_date)}</span>
                  <span>
                    <LoanStatusBadge status={loan.display_status} />
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      'size-4 justify-self-end text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                {/* Mobile card */}
                <button
                  onClick={() => toggle(loan.id)}
                  className="flex w-full cursor-pointer flex-col gap-2 px-5 py-4 text-left md:hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-serif text-[15px] font-semibold text-ink">
                      {loan.book?.title}
                    </span>
                    <LoanStatusBadge status={loan.display_status} />
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Pinjam: {formatDate(loan.borrowed_at)}</span>
                    <span>Tempo: {formatDate(loan.due_date)}</span>
                  </div>
                </button>

                {isOpen && <LoanDetail loan={loan} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

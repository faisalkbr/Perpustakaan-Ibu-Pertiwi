import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoanStatusBadge } from '@/components/LoanStatusBadge'
import { useLibrarianLoans, useApproveLoan, useRejectLoan } from '@/hooks/useLibrarianLoans'
import { formatDate, initials } from '@/lib/format'
import type { Loan, LoanStatus } from '@/types'

const TABS: { value: LoanStatus; label: string }[] = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'active', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
]

function RequestCard({ loan }: { loan: Loan }) {
  const approve = useApproveLoan()
  const reject = useRejectLoan()
  const available = loan.book?.available_copies ?? 0
  const isPending = loan.status === 'pending'
  const busy = approve.isPending || reject.isPending

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="size-11">
          <AvatarFallback>{initials(loan.member?.name ?? '?')}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-serif text-base font-semibold text-ink">
            {loan.member?.name}{' '}
            <span className="font-sans text-[13px] font-normal text-muted-foreground">
              · A-{loan.member ? 1000 + loan.member.id : '—'}
            </span>
          </div>
          <div className="mt-0.5 text-sm text-[#55504a]">
            mengajukan <span className="font-semibold text-primary">{loan.book?.title}</span>
            {isPending && (
              <>
                {' · '}
                {available > 0 ? (
                  <span>Stok tersedia: {available}</span>
                ) : (
                  <span className="text-destructive">Stok habis</span>
                )}
              </>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Tanggal pengajuan: {formatDate(loan.created_at)}
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex shrink-0 gap-2.5">
          <Button
            variant="outline"
            className="border-[#e2b6b4] text-destructive hover:bg-destructive/5 hover:text-destructive"
            disabled={busy}
            onClick={() => reject.mutate(loan.id)}
          >
            Tolak
          </Button>
          <Button
            className="bg-[#2e7d52] shadow-none hover:bg-[#256a45]"
            disabled={busy || available < 1}
            onClick={() => approve.mutate(loan.id)}
          >
            Setujui
          </Button>
        </div>
      ) : (
        <LoanStatusBadge status={loan.display_status} />
      )}
    </div>
  )
}

export default function LoanRequestsPage() {
  const [tab, setTab] = useState<LoanStatus>('pending')
  const { data, isLoading } = useLibrarianLoans(tab)
  const loans = data?.data ?? []

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-4 font-serif text-[22px] font-semibold text-ink">Konfirmasi Peminjaman</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as LoanStatus)} className="mb-6">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="font-serif text-lg text-foreground">Tidak ada pengajuan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengajuan dengan status ini akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {loans.map((loan) => (
            <RequestCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  )
}

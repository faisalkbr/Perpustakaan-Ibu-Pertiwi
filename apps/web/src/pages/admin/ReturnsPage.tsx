import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useLibrarianLoans, useReturnLoan } from '@/hooks/useLibrarianLoans'
import { formatDate, formatRupiah } from '@/lib/format'
import type { Loan } from '@/types'

const FINE_PER_DAY = 5000

function lateInfo(loan: Loan): { lateDays: number; fine: number } {
  const remaining = loan.days_remaining ?? 0
  const lateDays = remaining < 0 ? Math.abs(remaining) : 0
  return { lateDays, fine: lateDays * FINE_PER_DAY }
}

function ReturnRow({ loan }: { loan: Loan }) {
  const ret = useReturnLoan()
  const { lateDays, fine } = lateInfo(loan)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Anggota</div>
          <div className="font-serif font-semibold text-ink">{loan.member?.name}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">Judul Buku</div>
          <div className="font-serif font-semibold text-ink">{loan.book?.title}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">Tanggal Pinjam</div>
          <div className="text-sm font-medium text-[#2a2a2a]">{formatDate(loan.borrowed_at)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">Jatuh Tempo</div>
          <div
            className={`text-sm font-medium ${lateDays > 0 ? 'text-destructive' : 'text-[#2a2a2a]'}`}
          >
            {formatDate(loan.due_date)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
        {lateDays > 0 ? (
          <div className="text-right">
            <Badge variant="bad">Terlambat {lateDays} hari</Badge>
            <div className="mt-1 font-serif text-lg font-bold text-destructive">
              {formatRupiah(fine)}
            </div>
          </div>
        ) : (
          <Badge variant="ok">Tepat waktu</Badge>
        )}
        <Button disabled={ret.isPending} onClick={() => ret.mutate(loan.id)}>
          Proses Pengembalian
        </Button>
      </div>
    </div>
  )
}

export default function ReturnsPage() {
  const { data, isLoading } = useLibrarianLoans('active')
  const loans = data?.data ?? []

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-1 font-serif text-[22px] font-semibold text-ink">Pengembalian Buku</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Daftar peminjaman aktif. Denda {formatRupiah(FINE_PER_DAY)} / hari keterlambatan.
      </p>

      {isLoading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="font-serif text-lg text-foreground">Tidak ada peminjaman aktif</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua buku sudah dikembalikan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {loans.map((loan) => (
            <ReturnRow key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  )
}

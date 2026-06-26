import { useMemo, useState } from 'react'
import { BookOpenIcon, CoinsIcon, PrinterIcon, TrophyIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoanStatusBadge } from '@/components/LoanStatusBadge'
import { useReportSummary } from '@/hooks/useReports'
import { formatDate, formatRupiah } from '@/lib/format'
import type { ReportTransactionBook, ReportTransactionLoan, ReportType } from '@/types'

const TYPE_LABELS: Record<ReportType, string> = {
  peminjaman: 'Peminjaman',
  denda: 'Denda',
  koleksi: 'Koleksi',
}

/** First day of the month, `monthsAgo` months back, as YYYY-MM-DD. */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  return { start: isoDate(start), end: isoDate(now) }
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada data.</p>
  }
  return (
    <div className="flex h-52 items-end gap-2 overflow-x-auto pb-1">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-9 flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-primary/85 transition-all hover:bg-primary"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={String(d.value)}
            />
          </div>
          <span className="text-[10px] whitespace-nowrap text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof CoinsIcon
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate font-serif text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [draft, setDraft] = useState<{ type: ReportType; start: string; end: string }>(() => ({
    type: 'peminjaman',
    ...defaultRange(),
  }))
  const [applied, setApplied] = useState(draft)

  const { data, isLoading, isFetching } = useReportSummary(applied)
  const summary = data?.data

  const trendUnit = applied.type === 'denda' ? 'Rp' : 'pinjam'
  const trendData = useMemo(() => summary?.trend ?? [], [summary])

  const isCollection = summary?.type === 'koleksi'

  return (
    <div className="animate-in fade-in space-y-6 duration-300 print:space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-[22px] font-semibold text-ink">Laporan &amp; Rekapitulasi</h1>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <PrinterIcon className="size-4" />
          Cetak
        </Button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] print:hidden">
        <div>
          <Label className="mb-1.5">Jenis Laporan</Label>
          <Select
            value={draft.type}
            onValueChange={(v) => setDraft((d) => ({ ...d, type: v as ReportType }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peminjaman">Peminjaman</SelectItem>
              <SelectItem value="denda">Denda</SelectItem>
              <SelectItem value="koleksi">Koleksi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5">Periode Awal</Label>
          <Input
            type="date"
            value={draft.start}
            max={draft.end}
            onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
          />
        </div>
        <div>
          <Label className="mb-1.5">Periode Akhir</Label>
          <Input
            type="date"
            value={draft.end}
            min={draft.start}
            onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full lg:w-auto" onClick={() => setApplied(draft)} disabled={isFetching}>
            {isFetching ? 'Memuat…' : 'Generate'}
          </Button>
        </div>
      </div>

      {summary && (
        <p className="text-sm text-muted-foreground">
          Laporan <span className="font-medium text-ink">{TYPE_LABELS[summary.type]}</span> · periode{' '}
          {formatDate(summary.period.start)} – {formatDate(summary.period.end)}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-lg" />)
        ) : (
          <>
            <StatCard
              label="Total Peminjaman"
              value={String(summary?.totals.loans ?? 0)}
              icon={BookOpenIcon}
            />
            <StatCard
              label="Total Denda"
              value={formatRupiah(summary?.totals.fines ?? 0)}
              icon={CoinsIcon}
            />
            <StatCard
              label="Buku Terpopuler"
              value={summary?.top_book?.title ?? '—'}
              icon={TrophyIcon}
            />
          </>
        )}
      </div>

      {/* Trend chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-base font-semibold text-ink">
            {applied.type === 'denda' ? 'Tren Denda per Bulan' : 'Tren Peminjaman per Bulan'}
          </h2>
          <span className="text-[11px] text-muted-foreground">satuan: {trendUnit}</span>
        </div>
        {isLoading ? <Skeleton className="h-52 w-full" /> : <BarChart data={trendData} />}
      </div>

      {/* Detail table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="font-serif text-base font-semibold text-ink">
            {isCollection ? 'Rekap Koleksi' : 'Rincian Transaksi'}
          </h2>
        </div>
        <Table>
          {isCollection ? (
            <>
              <TableHeader>
                <TableRow className="bg-[#f5f6f8] hover:bg-[#f5f6f8]">
                  <TableHead>Judul</TableHead>
                  <TableHead>Pengarang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Dipinjam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={isFetching ? 'opacity-60' : ''}>
                {(summary?.transactions as ReportTransactionBook[] | undefined)?.length ? (
                  (summary!.transactions as ReportTransactionBook[]).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-serif font-semibold text-ink">{row.title}</TableCell>
                      <TableCell className="text-[#55504a]">{row.author}</TableCell>
                      <TableCell className="text-[#55504a]">{row.category ?? '—'}</TableCell>
                      <TableCell className="text-center">{row.stock}</TableCell>
                      <TableCell className="text-center font-medium">{row.loan_count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow span={5} loading={isLoading} />
                )}
              </TableBody>
            </>
          ) : (
            <>
              <TableHeader>
                <TableRow className="bg-[#f5f6f8] hover:bg-[#f5f6f8]">
                  <TableHead>Anggota</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead>Tgl Pinjam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Denda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={isFetching ? 'opacity-60' : ''}>
                {(summary?.transactions as ReportTransactionLoan[] | undefined)?.length ? (
                  (summary!.transactions as ReportTransactionLoan[]).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-ink">{row.member}</TableCell>
                      <TableCell className="text-[#55504a]">{row.book}</TableCell>
                      <TableCell className="text-[#55504a]">{formatDate(row.borrowed_at)}</TableCell>
                      <TableCell>
                        <LoanStatusBadge status={row.display_status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {row.fine > 0 ? (
                          <span className="font-medium text-destructive">
                            {formatRupiah(row.fine)}
                          </span>
                        ) : (
                          <Badge variant="ok">Lunas</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow span={5} loading={isLoading} />
                )}
              </TableBody>
            </>
          )}
        </Table>
      </div>
    </div>
  )
}

function EmptyRow({ span, loading }: { span: number; loading: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={span} className="py-10 text-center text-muted-foreground">
        {loading ? 'Memuat…' : 'Tidak ada data untuk periode ini.'}
      </TableCell>
    </TableRow>
  )
}

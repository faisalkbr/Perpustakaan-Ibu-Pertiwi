import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRightIcon, HeartIcon } from 'lucide-react'
import { BookCover } from '@/components/BookCover'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBook } from '@/hooks/useBooks'
import { useCreateLoan } from '@/hooks/useLoans'
import { ApiError } from '@/lib/api'
import { formatDate, formatRupiah } from '@/lib/format'
import type { Book } from '@/types'

const LOAN_DAYS = 14
const FINE_PER_DAY = 5000

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-[15px] font-medium text-foreground">{value || '—'}</div>
    </div>
  )
}

function ConfirmDialog({
  book,
  open,
  onOpenChange,
}: {
  book: Book
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const navigate = useNavigate()
  const createLoan = useCreateLoan()
  const [error, setError] = useState<string | null>(null)

  const today = new Date()
  const due = new Date()
  due.setDate(today.getDate() + LOAN_DAYS)

  const submit = () => {
    setError(null)
    createLoan.mutate(book.id, {
      onSuccess: () => {
        onOpenChange(false)
        navigate('/history')
      },
      onError: (err) => {
        setError(err instanceof ApiError ? (err.fieldErrors.book_id ?? err.message) : 'Gagal mengajukan.')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pengajuan</DialogTitle>
          <DialogDescription>Periksa kembali detail peminjaman Anda.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-[#efeeeb] p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Judul</span>
            <span className="text-right font-semibold text-foreground">{book.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tanggal Pinjam</span>
            <span className="font-semibold text-foreground">{formatDate(today.toISOString())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jatuh Tempo</span>
            <span className="font-semibold text-primary">{formatDate(due.toISOString())}</span>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Keterlambatan pengembalian dikenakan denda {formatRupiah(FINE_PER_DAY)} per hari.
        </p>

        {error && (
          <p className="rounded-sm border border-[#f1d3d1] bg-[#fbedec] px-3 py-2 text-[13px] text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={createLoan.isPending}
          >
            Batal
          </Button>
          <Button className="flex-1" onClick={submit} disabled={createLoan.isPending}>
            {createLoan.isPending ? 'Mengirim…' : 'Ajukan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  )
}

export default function BookDetailPage() {
  const { id } = useParams()
  const { data, isLoading, isError } = useBook(id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) return <DetailSkeleton />

  if (isError || !data?.data) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="font-serif text-lg text-foreground">Buku tidak ditemukan</p>
        <Link to="/catalog" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
          ← Kembali ke katalog
        </Link>
      </div>
    )
  }

  const book = data.data
  const available = book.available_copies

  return (
    <div className="animate-in fade-in duration-300">
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/catalog" className="hover:text-foreground">
          Katalog
        </Link>
        <ChevronRightIcon className="size-3.5" />
        {book.category && (
          <>
            <Link to={`/catalog?category=${encodeURIComponent(book.category)}`} className="hover:text-foreground">
              {book.category}
            </Link>
            <ChevronRightIcon className="size-3.5" />
          </>
        )}
        <span className="text-foreground">{book.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
        <div>
          <BookCover
            title={book.title}
            src={book.cover_url}
            className="border border-[#dadde2] shadow-[0_8px_24px_rgba(40,20,20,0.08)]"
          />
        </div>

        <div>
          {book.category && (
            <span className="eyebrow inline-block rounded-sm bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
              {book.category}
            </span>
          )}
          <h1 className="mt-3.5 font-serif text-[34px] leading-[1.12] font-semibold text-ink sm:text-[38px]">
            {book.title}
          </h1>
          <p className="mt-2 text-[17px] text-muted-foreground">{book.author}</p>

          <div className="mt-6">
            {available > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-sm border border-[var(--ok-border)] bg-[var(--ok-bg)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ok)]">
                <span className="size-2 rounded-full bg-[var(--ok)]" />
                Tersedia — {available} dari {book.stock} eksemplar
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-secondary px-3.5 py-2 text-[13px] font-semibold text-muted-foreground">
                <span className="size-2 rounded-full bg-[#a7aeb7]" />
                Sedang dipinjam — 0 dari {book.stock} eksemplar
              </span>
            )}
          </div>

          <div className="my-7 grid grid-cols-1 gap-x-10 gap-y-5 border-y border-[#e3e5e9] py-6 sm:grid-cols-2">
            <MetaItem label="Penerbit" value={book.publisher} />
            <MetaItem label="ISBN" value={book.isbn} />
            <MetaItem label="Kategori" value={book.category} />
            <MetaItem label="Tahun Terbit" value={book.published_year} />
          </div>

          <h3 className="mb-2.5 font-serif text-[17px] font-semibold text-ink">Deskripsi</h3>
          <p className="max-w-[620px] text-[15px] leading-[1.7] text-[#55504a]">
            {book.description || 'Belum ada deskripsi untuk buku ini.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Button size="lg" disabled={available < 1} onClick={() => setConfirmOpen(true)}>
              {available > 0 ? 'Ajukan Peminjaman' : 'Tidak Tersedia'}
            </Button>
            <Button variant="outline" size="lg">
              <HeartIcon className="size-4" />
              Simpan
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog book={book} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </div>
  )
}

import { useState } from 'react'
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BookFormDialog } from '@/components/admin/BookFormDialog'
import { useBooks } from '@/hooks/useBooks'
import { useDeleteBook } from '@/hooks/useBookMutations'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Book } from '@/types'

export default function BooksAdminPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search, 350)
  const [dialog, setDialog] = useState<{ open: boolean; book: Book | null }>({
    open: false,
    book: null,
  })
  const deleteBook = useDeleteBook()

  const { data, isLoading, isFetching } = useBooks({
    search: debounced,
    page,
    per_page: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const books = data?.data ?? []
  const meta = data?.meta

  const onDelete = (book: Book) => {
    if (window.confirm(`Hapus buku "${book.title}"?`)) deleteBook.mutate(book.id)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-serif text-[22px] font-semibold text-ink">Data Buku</h1>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari judul atau pengarang..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialog({ open: true, book: null })}>
          <PlusIcon className="size-4" />
          Tambah Buku
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5f6f8] hover:bg-[#f5f6f8]">
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Pengarang</TableHead>
              <TableHead>Penerbit</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Tidak ada buku ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="text-muted-foreground">
                    B-{String(book.id).padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-serif font-semibold text-ink whitespace-normal">
                    {book.title}
                  </TableCell>
                  <TableCell className="text-[#55504a]">{book.author}</TableCell>
                  <TableCell className="text-[#55504a]">{book.publisher ?? '—'}</TableCell>
                  <TableCell className="text-[#55504a]">{book.category ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{book.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setDialog({ open: true, book })}
                        aria-label="Edit"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(book)}
                        aria-label="Hapus"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} buku
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      )}

      <BookFormDialog
        open={dialog.open}
        book={dialog.book}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
      />
    </div>
  )
}

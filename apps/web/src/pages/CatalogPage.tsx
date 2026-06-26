import { useSearchParams } from 'react-router-dom'
import { ChevronDownIcon } from 'lucide-react'
import { BookCard } from '@/components/BookCard'
import { BookCover } from '@/components/BookCover'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBooks } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'

const SORT_OPTIONS = [
  { label: 'Terbaru', sort_by: 'created_at', sort_order: 'desc' },
  { label: 'Judul A–Z', sort_by: 'title', sort_order: 'asc' },
  { label: 'Penulis A–Z', sort_by: 'author', sort_order: 'asc' },
  { label: 'Stok terbanyak', sort_by: 'stock', sort_order: 'desc' },
] as const

function FilterButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 items-center gap-2 rounded-sm border border-input bg-card px-3.5 text-sm font-medium text-foreground">
      {children}
      <ChevronDownIcon className="size-3.5 text-muted-foreground" />
    </span>
  )
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categoriesData } = useCategories()

  const page = Number(searchParams.get('page') ?? 1)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortBy = searchParams.get('sort_by') ?? 'created_at'
  const sortOrder = searchParams.get('sort_order') ?? 'desc'

  const { data, isLoading, isError, error, isFetching } = useBooks({
    page,
    search,
    category,
    sort_by: sortBy,
    sort_order: sortOrder,
    per_page: 12,
  })

  const books = data?.data ?? []
  const meta = data?.meta
  const categories = categoriesData?.data ?? []
  const activeSort = SORT_OPTIONS.find((o) => o.sort_by === sortBy) ?? SORT_OPTIONS[0]

  const setParam = (patch: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value === null) next.delete(key)
        else next.set(key, String(value))
      }
      return next
    })
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Koleksi</p>
          <h1 className="mt-1.5 text-[30px] leading-tight font-semibold text-ink">Katalog Buku</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {meta
              ? `Menampilkan ${meta.total} koleksi di perpustakaan`
              : 'Memuat koleksi…'}
            {search && (
              <>
                {' '}
                untuk “<span className="text-foreground">{search}</span>”
              </>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <FilterButton>{category || 'Kategori'}</FilterButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 w-48 overflow-y-auto">
              <DropdownMenuLabel>Kategori</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={category === ''}
                onCheckedChange={() => setParam({ category: null, page: 1 })}
              >
                Semua kategori
              </DropdownMenuCheckboxItem>
              {categories.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={category === c}
                  onCheckedChange={() => setParam({ category: c, page: 1 })}
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <FilterButton>{activeSort.label}</FilterButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {SORT_OPTIONS.map((o) => (
                <DropdownMenuItem
                  key={o.label}
                  onSelect={() =>
                    setParam({ sort_by: o.sort_by, sort_order: o.sort_order, page: 1 })
                  }
                >
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6">
        {isError ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : 'Gagal memuat katalog.'}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-sm border border-border bg-card">
                <BookCover className="rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <p className="font-serif text-lg text-foreground">Tidak ada buku ditemukan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coba ubah kata kunci pencarian atau filter kategori.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-5 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${
              isFetching ? 'opacity-60' : ''
            }`}
          >
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Halaman {meta.current_page} dari {meta.last_page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => setParam({ page: meta.current_page - 1 })}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setParam({ page: meta.current_page + 1 })}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

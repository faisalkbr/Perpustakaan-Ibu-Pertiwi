import { Link } from 'react-router-dom'
import { BookCover } from '@/components/BookCover'
import { cn } from '@/lib/utils'
import type { Book } from '@/types'

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(40,20,20,0.25)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
    >
      <BookCover title={book.title} className="rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        {book.category && (
          <span className="eyebrow mb-2 inline-block w-fit rounded-sm bg-secondary px-1.5 py-1 text-[10px] text-secondary-foreground">
            {book.category}
          </span>
        )}
        <h3 className="font-serif text-[15px] leading-snug font-semibold text-foreground group-hover:text-primary">
          {book.title}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{book.author}</p>
        <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold">
          <span
            className={cn(
              'size-[7px] rounded-full',
              book.is_available ? 'bg-[var(--ok)]' : 'bg-[#a7aeb7]',
            )}
          />
          <span className={book.is_available ? 'text-[var(--ok)]' : 'text-muted-foreground'}>
            {book.is_available ? 'Tersedia' : 'Dipinjam'}
          </span>
        </div>
      </div>
    </Link>
  )
}

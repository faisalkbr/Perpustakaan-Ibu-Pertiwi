import { cn } from '@/lib/utils'

/**
 * Striped "sampul buku" placeholder cover (3:4) matching the design. When a
 * real cover image exists it is rendered instead.
 */
export function BookCover({
  title,
  src,
  className,
}: {
  title?: string
  src?: string | null
  className?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={title ? `Sampul ${title}` : 'Sampul buku'}
        className={cn('aspect-[3/4] w-full rounded-sm object-cover', className)}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        'flex aspect-[3/4] items-center justify-center rounded-sm text-[10px] font-medium text-[#9c988e]',
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg,#E6E4DE,#E6E4DE 9px,#DCD9D2 9px,#DCD9D2 18px)',
      }}
    >
      <span className="font-sans tracking-wide">sampul buku</span>
    </div>
  )
}

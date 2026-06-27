import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Striped "sampul buku" placeholder cover (3:4) matching the design. When a
 * real cover image exists it is rendered instead — and if that image fails to
 * load (e.g. the remote cover is missing), it falls back to the placeholder.
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
  const [failed, setFailed] = useState(false)

  // Reset the error state when the source changes so a new URL gets a fresh try.
  useEffect(() => setFailed(false), [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={title ? `Sampul ${title}` : 'Sampul buku'}
        loading="lazy"
        onError={() => setFailed(true)}
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

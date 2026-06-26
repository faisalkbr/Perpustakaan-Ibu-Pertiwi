import { cn } from '@/lib/utils'

interface WordmarkProps {
  /** Use the light (cream) variant for dark backgrounds. */
  variant?: 'dark' | 'light'
  /** Logo image height in px. */
  size?: number
  className?: string
}

/** The "IBU PERTIWI / LIBRARY" lockup used across the app shell. */
export function Wordmark({ variant = 'dark', size = 40, className }: WordmarkProps) {
  const light = variant === 'light'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src={light ? '/logo-white.png' : '/logo.png'}
        alt="Logo Perpustakaan Ibu Pertiwi"
        style={{ height: size }}
        className="w-auto shrink-0 select-none"
        draggable={false}
      />
      <div className="flex flex-col items-center leading-none">
        <span
          className={cn('wordmark-main text-[16px]', light ? 'text-cream' : 'text-[#111]')}
        >
          IBU PERTIWI
        </span>
        <span
          className={cn(
            'wordmark-sub mt-1 text-[8.5px]',
            light ? 'text-cream/70' : 'text-[#333]',
          )}
        >
          LIBRARY
        </span>
      </div>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { BookIcon, LogOutIcon, RotateCcwIcon, UsersIcon, ClipboardCheckIcon } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/useAuthStore'
import { useLogout } from '@/hooks/useAuth'
import { useLoanCounts } from '@/hooks/useLibrarianLoans'
import { initials } from '@/lib/format'
import { ROLE_LABELS } from '@/lib/roles'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin/books', label: 'Data Buku', icon: BookIcon },
  { to: '/admin/members', label: 'Data Anggota', icon: UsersIcon },
  { to: '/admin/loans', label: 'Konfirmasi Peminjaman', icon: ClipboardCheckIcon, badge: 'pending' as const },
  { to: '/admin/returns', label: 'Pengembalian', icon: RotateCcwIcon },
]

function NavItems({ pending, onNavigate }: { pending?: number; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-white/70 hover:bg-white/5 hover:text-white',
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1">{label}</span>
          {badge === 'pending' && pending ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-primary">
              {pending}
            </span>
          ) : null}
        </NavLink>
      ))}
    </>
  )
}

export default function LibrarianLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { data: counts } = useLoanCounts()
  const pending = counts?.data.pending

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[236px] shrink-0 flex-col bg-[#3A1419] lg:flex">
        <div className="flex h-[68px] items-center border-b border-white/10 px-5">
          <Wordmark variant="light" size={32} />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3.5">
          <p className="eyebrow px-3 pt-2 pb-1 text-[11px] text-white/40">
            {ROLE_LABELS[user?.role ?? 'librarian']}
          </p>
          <NavItems pending={pending} />
        </nav>
        <div className="border-t border-white/10 p-3.5">
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-3 rounded-sm px-3.5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOutIcon className="size-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top bar + nav strip */}
      <div className="bg-[#3A1419] lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Wordmark variant="light" size={30} />
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-1.5 text-sm font-medium text-white/70"
          >
            <LogOutIcon className="size-4" />
            Keluar
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          <NavItems pending={pending} />
        </nav>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col bg-background">
        <header className="flex h-[68px] items-center justify-between border-b border-border bg-card px-6">
          <span className="font-serif text-[15px] font-semibold text-muted-foreground">
            Panel {ROLE_LABELS[user?.role ?? 'librarian']}
          </span>
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9">
              <AvatarFallback>{initials(user?.name ?? 'P')}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-[13px] font-semibold text-foreground">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {ROLE_LABELS[user?.role ?? 'librarian']}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

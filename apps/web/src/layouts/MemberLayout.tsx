import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOutIcon, SearchIcon } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/useAuthStore'
import { useLogout } from '@/hooks/useAuth'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

function SearchBox({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        navigate(`/catalog?search=${encodeURIComponent(value.trim())}`)
      }}
      className={cn(
        'flex h-10 items-center gap-2.5 rounded-sm border border-input bg-[#f7f6f3] px-3.5 text-muted-foreground focus-within:border-ring focus-within:bg-card',
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari judul, pengarang, atau kategori..."
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </form>
  )
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'font-garamond text-[15px] font-semibold tracking-wide transition-colors',
    isActive ? 'text-primary' : 'text-[#5a5a5a] hover:text-foreground',
  )

export default function MemberLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-card">
        <div className="h-1 bg-primary" />
        <div className="border-b border-border">
          <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-4 px-4 sm:px-6">
            <NavLink to="/catalog" className="shrink-0">
              <Wordmark size={38} />
            </NavLink>

            <SearchBox className="hidden flex-1 md:flex" />

            <nav className="ml-auto hidden items-center gap-6 md:flex">
              <NavLink to="/catalog" className={navLinkClass}>
                Katalog
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                Riwayat
              </NavLink>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 md:ml-2">
                <Avatar>
                  <AvatarFallback>{initials(user?.name ?? 'U')}</AvatarFallback>
                </Avatar>
                <span className="hidden font-garamond text-[15px] font-semibold text-foreground sm:inline">
                  {user?.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-foreground">
                  {user?.name}
                  <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground capitalize">
                    {user?.role === 'member' ? 'Anggota' : user?.role}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <NavLink to="/catalog">Katalog</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <NavLink to="/history">Riwayat</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem
                  onSelect={() => logout.mutate()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="px-4 pb-3 md:hidden">
            <SearchBox />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        <Outlet />
      </main>
    </div>
  )
}

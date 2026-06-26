import { useState } from 'react'
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MemberFormDialog } from '@/components/admin/MemberFormDialog'
import { useMembers, useDeleteMember } from '@/hooks/useMembers'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Member } from '@/types'

export default function MembersAdminPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search, 350)
  const [dialog, setDialog] = useState<{ open: boolean; member: Member | null }>({
    open: false,
    member: null,
  })
  const deleteMember = useDeleteMember()

  const { data, isLoading, isFetching } = useMembers({ search: debounced, page })
  const members = data?.data ?? []
  const meta = data?.meta

  const onDelete = (member: Member) => {
    if (window.confirm(`Hapus anggota "${member.name}"?`)) deleteMember.mutate(member.id)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-5 font-serif text-[22px] font-semibold text-ink">Data Anggota</h1>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari nama atau email..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialog({ open: true, member: null })}>
          <PlusIcon className="size-4" />
          Tambah Anggota
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5f6f8] hover:bg-[#f5f6f8]">
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. Telepon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Tidak ada anggota ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="text-muted-foreground">
                    A-{String(1000 + member.id)}
                  </TableCell>
                  <TableCell className="font-serif font-semibold text-ink">{member.name}</TableCell>
                  <TableCell className="text-[#55504a]">{member.email}</TableCell>
                  <TableCell className="text-[#55504a]">{member.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? 'ok' : 'default'}>
                      {member.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setDialog({ open: true, member })}
                        aria-label="Edit"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(member)}
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
            Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} anggota
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

      <MemberFormDialog
        open={dialog.open}
        member={dialog.member}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
      />
    </div>
  )
}

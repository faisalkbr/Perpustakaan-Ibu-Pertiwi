import type { Role } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  member: 'Anggota',
  librarian: 'Pustakawan',
  head: 'Kepala Perpustakaan',
}

/** Where a user lands after login, based on role. */
export function homePathForRole(role: Role | undefined): string {
  return role === 'librarian' || role === 'head' ? '/admin/books' : '/catalog'
}

export function isStaff(role: Role | undefined): boolean {
  return role === 'librarian' || role === 'head'
}

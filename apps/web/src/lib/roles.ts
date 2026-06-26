import type { Role } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  member: 'Anggota',
  librarian: 'Pustakawan',
  head: 'Kepala Perpustakaan',
}

/** Where a user lands after login, based on role. */
export function homePathForRole(role: Role | undefined): string {
  if (role === 'librarian' || role === 'head') return '/admin/books'
  if (role === 'member') return '/catalog'
  // Unknown/corrupt role (e.g. stale persisted session) — send to login.
  return '/login'
}

export function isStaff(role: Role | undefined): boolean {
  return role === 'librarian' || role === 'head'
}

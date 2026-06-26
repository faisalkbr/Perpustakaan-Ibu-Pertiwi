import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { homePathForRole } from '@/lib/roles'
import type { Role } from '@/types'

/**
 * Guards a route subtree. Redirects to /login when unauthenticated, or to the
 * user's own home when authenticated but lacking one of the allowed roles.
 */
export default function ProtectedRoute({ allow }: { allow?: Role[] }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token) return <Navigate to="/login" replace />
  if (allow && user && !allow.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  return <Outlet />
}

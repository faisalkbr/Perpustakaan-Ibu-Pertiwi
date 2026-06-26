import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { homePathForRole } from '@/lib/roles'
import ProtectedRoute from '@/routes/ProtectedRoute'
import MemberLayout from '@/layouts/MemberLayout'
import LibrarianLayout from '@/layouts/LibrarianLayout'
import LoginPage from '@/pages/LoginPage'
import CatalogPage from '@/pages/CatalogPage'
import BookDetailPage from '@/pages/BookDetailPage'
import HistoryPage from '@/pages/HistoryPage'
import BooksAdminPage from '@/pages/admin/BooksAdminPage'
import MembersAdminPage from '@/pages/admin/MembersAdminPage'
import LoanRequestsPage from '@/pages/admin/LoanRequestsPage'
import ReturnsPage from '@/pages/admin/ReturnsPage'
import StaffAdminPage from '@/pages/admin/StaffAdminPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function HomeRedirect() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  return <Navigate to={token ? homePathForRole(user?.role) : '/login'} replace />
}

function LoginRoute() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  return token ? <Navigate to={homePathForRole(user?.role)} replace /> : <LoginPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomeRedirect />} />
        <Route path="/login" element={<LoginRoute />} />

        {/* Member */}
        <Route element={<ProtectedRoute allow={['member']} />}>
          <Route element={<MemberLayout />}>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        {/* Librarian / Head */}
        <Route element={<ProtectedRoute allow={['librarian', 'head']} />}>
          <Route element={<LibrarianLayout />}>
            <Route path="/admin/books" element={<BooksAdminPage />} />
            <Route path="/admin/members" element={<MembersAdminPage />} />
            <Route path="/admin/loans" element={<LoanRequestsPage />} />
            <Route path="/admin/returns" element={<ReturnsPage />} />

            {/* Head librarian only */}
            <Route element={<ProtectedRoute allow={['head']} />}>
              <Route path="/admin/staff" element={<StaffAdminPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

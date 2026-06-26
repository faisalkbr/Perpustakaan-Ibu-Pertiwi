import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import ProtectedRoute from '@/routes/ProtectedRoute'
import MemberLayout from '@/layouts/MemberLayout'
import LoginPage from '@/pages/LoginPage'
import CatalogPage from '@/pages/CatalogPage'
import BookDetailPage from '@/pages/BookDetailPage'
import HistoryPage from '@/pages/HistoryPage'
import NotFoundPage from '@/pages/NotFoundPage'

function LoginRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/catalog" replace /> : <LoginPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/catalog" replace />} />
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MemberLayout />}>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-primary">404</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
      </p>
      <Button asChild className="mt-6">
        <Link to="/catalog">Kembali ke Katalog</Link>
      </Button>
    </div>
  )
}

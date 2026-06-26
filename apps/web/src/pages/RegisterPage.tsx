import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, MapPinIcon, UserIcon } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterValues } from '@/schemas/auth'
import { useRegister } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { homePathForRole } from '@/lib/roles'

function EditorialPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-panel p-12 lg:flex lg:p-[52px]">
      {/* paper grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'repeating-linear-gradient(90deg,rgba(255,255,255,.018),rgba(255,255,255,.018) 1px,transparent 1px,transparent 5px)',
        }}
      />
      {/* inset book-cover frames */}
      <div className="pointer-events-none absolute inset-[22px] border border-[rgba(212,160,120,0.22)]" />
      <div className="pointer-events-none absolute inset-[27px] border border-[rgba(212,160,120,0.12)]" />

      <Wordmark variant="light" size={48} className="relative" />

      <div className="relative">
        <div className="mb-1 font-serif text-[70px] leading-[0.7] font-bold text-primary">“</div>
        <h2 className="mb-5 max-w-[430px] font-serif text-[33px] leading-[1.34] font-medium text-cream">
          Gerbang ilmu pengetahuan terbuka lebar bagi mereka yang mencari kebenaran.
        </h2>
        <div className="mb-4 h-0.5 w-[54px] bg-primary" />
        <p className="max-w-[380px] text-sm leading-relaxed text-cream/60">
          Daftarkan diri Anda sebagai anggota Perpustakaan Ibu Pertiwi untuk meminjam koleksi buku, mengakses literatur akademik, dan mengelola riwayat pembacaan Anda.
        </p>
      </div>

      <div className="relative flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="max-w-[330px] text-[12.5px] leading-relaxed text-cream/60">
            Desa Ibu Pertiwi, Kab. Probolinggo, Jawa Timur, 67251 · (022) 765-4321
          </p>
        </div>
        <div className="h-px max-w-[330px] bg-[rgba(212,160,120,0.18)]" />
        <div className="text-[12px] tracking-wide text-cream/40">
          © {new Date().getFullYear()} Perpustakaan Ibu Pertiwi
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (values: RegisterValues) => {
    setFormError(null)
    registerMutation.mutate(values, {
      onSuccess: ({ user }) => {
        navigate(homePathForRole(user.role), { replace: true })
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const fieldErrors = error.fieldErrors
          if (Object.keys(fieldErrors).length > 0) {
            Object.entries(fieldErrors).forEach(([field, msg]) => {
              setError(field as keyof RegisterValues, { type: 'server', message: msg })
            })
          }
          setFormError(error.message)
        } else {
          setFormError('Terjadi kesalahan. Coba lagi.')
        }
      },
    })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[560px_1fr]">
      <EditorialPanel />

      <div className="flex items-center justify-center bg-[#efeeeb] px-5 py-10">
        <div className="w-full max-w-[392px]">
          {/* mobile brand */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Wordmark size={44} />
          </div>

          <p className="eyebrow mb-3.5 text-primary">Keanggotaan Baru</p>
          <h1 className="mb-2 text-[33px] leading-tight font-semibold text-ink">Registrasi Anggota</h1>
          <p className="text-[15px] text-muted-foreground">
            Lengkapi formulir di bawah ini untuk membuat akun perpustakaan Anda.
          </p>
          <div className="mt-5 mb-7 h-0.5 w-[54px] bg-primary" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#a99a84]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  className="pl-10"
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#a99a84]" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alamat email Anda"
                  className="pl-10"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#a99a84]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  className="px-10"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a99a84] hover:text-foreground"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#a99a84]" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Masukkan ulang kata sandi"
                  className="px-10"
                  aria-invalid={Boolean(errors.password_confirmation)}
                  {...register('password_confirmation')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a99a84] hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
              )}
            </div>

            {formError && (
              <div className="flex items-center gap-2.5 rounded-sm border border-[#e9cfcc] bg-[#fbedec] px-3.5 py-3">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                  !
                </span>
                <span className="text-[13px] text-[#8e1a28]">{formError}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Memproses…' : 'Daftar Anggota'}
              {!registerMutation.isPending && <ArrowRightIcon className="size-4" />}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3.5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-center text-[13px] text-[#827e74]">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
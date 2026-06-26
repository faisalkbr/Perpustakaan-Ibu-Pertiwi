import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi, type LoginPayload, type RegisterPayload } from '@/services/auth'
import { useAuthStore } from '@/store/useAuthStore'

export function useLogin() {
  const setCredentials = useAuthStore((s) => s.setCredentials)
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ token, user }) => {
      setCredentials(token, user)
      toast.success(`Selamat datang, ${user.name}`)
    },
  })
}

export function useRegister() {
  const setCredentials = useAuthStore((s) => s.setCredentials)
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ token, user }) => {
      setCredentials(token, user)
      toast.success(`Pendaftaran berhasil. Selamat datang, ${user.name}!`)
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return useMutation({
    mutationFn: () => authApi.logout(),
    // Clear locally regardless of server outcome (token may already be invalid).
    onSettled: () => {
      logout()
      toast.success('Anda telah keluar')
    },
  })
}

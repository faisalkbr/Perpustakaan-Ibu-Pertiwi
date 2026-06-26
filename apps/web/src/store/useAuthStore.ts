import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  setCredentials: (token: string, user: User) => void
  logout: () => void
}

/**
 * Auth store persisted to localStorage (`auth-storage`). Both setCredentials
 * and logout clear the Query cache to avoid leaking data between sessions.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setCredentials: (token, user) => {
        queryClient.clear()
        set({ token, user })
      },
      logout: () => {
        queryClient.clear()
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

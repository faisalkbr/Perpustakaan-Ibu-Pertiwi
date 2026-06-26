import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { librarianLoansApi } from '@/services/librarianLoans'
import { queryKeys } from '@/lib/queryKeys'
import type { LoanStatus } from '@/types'

export function useLibrarianLoans(status?: LoanStatus) {
  return useQuery({
    queryKey: queryKeys.librarianLoans.list(status),
    queryFn: () => librarianLoansApi.list(status),
  })
}

export function useLoanCounts() {
  return useQuery({
    queryKey: queryKeys.librarianLoans.counts,
    queryFn: () => librarianLoansApi.counts(),
    staleTime: 30_000,
  })
}

function useLoanAction(
  action: (id: number) => Promise<unknown>,
  successMessage: string,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => action(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.librarianLoans.all })
      qc.invalidateQueries({ queryKey: queryKeys.books.all })
      toast.success(successMessage)
    },
  })
}

export function useApproveLoan() {
  return useLoanAction(librarianLoansApi.approve, 'Peminjaman disetujui')
}

export function useRejectLoan() {
  return useLoanAction(librarianLoansApi.reject, 'Peminjaman ditolak')
}

export function useReturnLoan() {
  return useLoanAction(librarianLoansApi.returnBook, 'Pengembalian diproses')
}

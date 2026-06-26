import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { loansApi } from '@/services/loans'
import { queryKeys, type LoanListParams } from '@/lib/queryKeys'

export function useLoans(params: LoanListParams) {
  return useQuery({
    queryKey: queryKeys.loans.list(params),
    queryFn: () => loansApi.list(params),
  })
}

export function useCreateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bookId: number) => loansApi.create(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.loans.all })
      qc.invalidateQueries({ queryKey: queryKeys.books.all })
      toast.success('Pengajuan peminjaman terkirim', {
        description: 'Menunggu konfirmasi pustakawan.',
      })
    },
  })
}

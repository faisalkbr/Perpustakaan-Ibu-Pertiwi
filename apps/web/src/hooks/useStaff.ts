import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffApi, type StaffListParams, type StaffPayload } from '@/services/staff'
import { queryKeys } from '@/lib/queryKeys'

export function useStaff(params: StaffListParams) {
  return useQuery({
    queryKey: queryKeys.staff.list(params as Record<string, unknown>),
    queryFn: () => staffApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffPayload) => staffApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.staff.all })
      toast.success('Staf ditambahkan')
    },
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StaffPayload> }) =>
      staffApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.staff.all })
      toast.success('Staf diperbarui')
    },
  })
}

export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => staffApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.staff.all })
      toast.success('Staf dihapus')
    },
    onError: (err) => {
      // Surface guard errors (e.g. "cannot delete your own account").
      const message = err instanceof Error ? err.message : 'Gagal menghapus staf'
      toast.error(message)
    },
  })
}

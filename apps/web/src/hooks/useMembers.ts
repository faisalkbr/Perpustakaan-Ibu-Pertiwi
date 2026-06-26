import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { membersApi, type MemberListParams, type MemberPayload } from '@/services/members'
import { queryKeys } from '@/lib/queryKeys'

export function useMembers(params: MemberListParams) {
  return useQuery({
    queryKey: queryKeys.members.list(params as Record<string, unknown>),
    queryFn: () => membersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MemberPayload) => membersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all })
      toast.success('Anggota ditambahkan')
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MemberPayload> }) =>
      membersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all })
      toast.success('Anggota diperbarui')
    },
  })
}

export function useDeleteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => membersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all })
      toast.success('Anggota dihapus')
    },
  })
}

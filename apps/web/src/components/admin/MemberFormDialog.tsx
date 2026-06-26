import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { memberSchema, toMemberPayload, type MemberFormValues } from '@/schemas/member'
import { useCreateMember, useUpdateMember } from '@/hooks/useMembers'
import { ApiError } from '@/lib/api'
import type { Member } from '@/types'

const EMPTY: MemberFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  member: Member | null
}) {
  const isEdit = Boolean(member)
  const create = useCreateMember()
  const update = useUpdateMember()
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      member
        ? {
            name: member.name,
            email: member.email,
            phone: member.phone ?? '',
            address: member.address ?? '',
            is_active: member.is_active,
          }
        : EMPTY,
    )
  }, [open, member, reset])

  const onSubmit = (values: MemberFormValues) => {
    const onError = (err: unknown) => {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([k, m]) =>
          setError(k as keyof MemberFormValues, { message: m }),
        )
      }
    }
    const onSuccess = () => onOpenChange(false)
    const payload = toMemberPayload(values)
    if (isEdit && member) update.mutate({ id: member.id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Anggota' : 'Tambah Anggota'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4" noValidate>
          <div className="col-span-2">
            <Label className="mb-1.5">Nama</Label>
            <Input placeholder="Nama lengkap" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5">Email</Label>
            <Input type="email" placeholder="nama@contoh.id" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5">No. Telepon</Label>
            <Input placeholder="08xx-xxxx-xxxx" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5">Status</Label>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Select
                  value={field.value ? 'active' : 'inactive'}
                  onValueChange={(v) => field.onChange(v === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5">Alamat</Label>
            <Textarea placeholder="Alamat lengkap anggota" {...register('address')} />
            {errors.address && (
              <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter className="col-span-2 mt-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

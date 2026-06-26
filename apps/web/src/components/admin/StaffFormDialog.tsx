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
import { staffSchema, toStaffPayload, type StaffFormValues } from '@/schemas/staff'
import { useCreateStaff, useUpdateStaff } from '@/hooks/useStaff'
import { ApiError } from '@/lib/api'
import type { Staff } from '@/types'

const EMPTY: StaffFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'librarian',
  is_active: true,
}

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  isSelf,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  staff: Staff | null
  /** True when editing your own account — locks role/status to avoid self-lockout. */
  isSelf?: boolean
}) {
  const isEdit = Boolean(staff)
  const create = useCreateStaff()
  const update = useUpdateStaff()
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({ resolver: zodResolver(staffSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      staff
        ? {
            name: staff.name,
            email: staff.email,
            phone: staff.phone ?? '',
            address: staff.address ?? '',
            role: staff.role,
            is_active: staff.is_active,
          }
        : EMPTY,
    )
  }, [open, staff, reset])

  const onSubmit = (values: StaffFormValues) => {
    const onError = (err: unknown) => {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([k, m]) =>
          setError(k as keyof StaffFormValues, { message: m }),
        )
      }
    }
    const onSuccess = () => onOpenChange(false)
    const payload = toStaffPayload(values)
    if (isEdit && staff) update.mutate({ id: staff.id, payload }, { onSuccess, onError })
    else create.mutate(payload, { onSuccess, onError })
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Staf' : 'Tambah Staf'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4" noValidate>
          <div className="col-span-2">
            <Label className="mb-1.5">Nama</Label>
            <Input placeholder="Nama lengkap" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5">Email</Label>
            <Input type="email" placeholder="nama@perpustakaan.test" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5">No. Telepon</Label>
            <Input placeholder="08xx-xxxx-xxxx" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5">Jabatan</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSelf}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="librarian">Pustakawan</SelectItem>
                    <SelectItem value="head">Kepala Perpustakaan</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
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
                  disabled={isSelf}
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
            <Textarea placeholder="Alamat lengkap staf" {...register('address')} />
            {errors.address && (
              <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          {isSelf && (
            <p className="col-span-2 -mt-1 text-xs text-muted-foreground">
              Jabatan dan status akun Anda sendiri tidak dapat diubah dari sini.
            </p>
          )}

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

'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function TambahBarangPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const category = String(form.get('category') ?? '').trim()
    const stock = Number(form.get('stock'))
    const value = Number(form.get('value'))

    if (!name || !category || !Number.isFinite(stock) || stock < 0 || !Number.isFinite(value) || value < 0) {
      toast.error('Lengkapi data barang dengan nilai yang valid.')
      return
    }

    setSaving(true)
    toast.success('Barang berhasil disimpan.')
    router.push('/aktivitas')
  }

  return (
    <main className="flex flex-col gap-6 px-4 py-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali">
          <Link href="/dashboard"><ArrowLeft className="size-5" aria-hidden="true" /></Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Admin gudang</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tambah Barang</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Barang</Label>
          <Input id="name" name="name" placeholder="Contoh: Baut UK 1×2" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" name="category" placeholder="Contoh: Peralatan" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Stok</Label>
          <Input id="stock" name="stock" type="number" min="0" step="1" placeholder="0" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="value">Harga/Nilai</Label>
          <Input id="value" name="value" type="number" min="0" step="1000" placeholder="0" required />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={saving}>
          <Save className="size-4" aria-hidden="true" />
          {saving ? 'Menyimpan…' : 'Simpan Barang'}
        </Button>
      </form>
    </main>
  )
}

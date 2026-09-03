'use client'

import { useEffect, useState } from 'react'
import { Package, Tags, Warehouse, Grid3x3, ClipboardList } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProductImage } from '@/components/product-image'
import { localInventoryEvent, readLocalActivity, readLocalItems, type LocalItem, type ActivityLog } from '@/lib/local-inventory'

type Props = { initial: { totalProducts: number; totalCategories: number; totalWarehouses: number; totalRacks: number } }
export function DashboardLive({ initial }: Props) {
  const [items, setItems] = useState<LocalItem[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const refresh = () => { setItems(readLocalItems()); setActivity(readLocalActivity()) }
  useEffect(() => { refresh(); window.addEventListener(localInventoryEvent, refresh); return () => window.removeEventListener(localInventoryEvent, refresh) }, [])
  const stats = { ...initial, totalProducts: initial.totalProducts + items.length, totalCategories: initial.totalCategories + new Set(items.map((i) => i.category)).size, totalWarehouses: initial.totalWarehouses + new Set(items.map((i) => i.warehouse)).size, totalRacks: initial.totalRacks + new Set(items.map((i) => i.rack)).size }
  return <>
    <section aria-label="Ringkasan gudang"><div className="grid grid-cols-2 gap-3"><StatCard label="Jenis Barang" value={stats.totalProducts} icon={Package} tone="primary" /><StatCard label="Kategori" value={stats.totalCategories} icon={Tags} tone="neutral" /><StatCard label="Gudang" value={stats.totalWarehouses} icon={Warehouse} tone="neutral" /><StatCard label="Rak" value={stats.totalRacks} icon={Grid3x3} tone="neutral" /></div></section>
    <section aria-labelledby="activity-heading" className="flex flex-col gap-3"><h3 id="activity-heading" className="text-base font-semibold">Aktivitas Terbaru</h3>{activity.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada aktivitas</p> : <div className="flex flex-col gap-2">{activity.slice(0, 4).map((log) => <div key={log.id} className="rounded-xl border bg-card p-3 text-sm">{log.message}</div>)}</div>}</section>
    <section aria-labelledby="latest-heading" className="flex flex-col gap-3"><h3 id="latest-heading" className="text-base font-semibold">Barang Terbaru</h3>{items.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada barang baru</p> : <div className="flex flex-col gap-2">{items.slice(0, 4).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-3"><ProductImage src={item.photo} alt={item.name} className="size-12 rounded-lg" /><div className="min-w-0"><p className="truncate font-medium">{item.name} <span className="text-muted-foreground">· {item.size}</span></p><p className="text-xs text-muted-foreground">{item.category} · {item.stock} unit</p></div></div>)}</div>}</section>
  </>
}

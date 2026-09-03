import Link from 'next/link'
import {
  Package,
  Tags,
  Warehouse as WarehouseIcon,
  Grid3x3,
  ClipboardList,
  TriangleAlert,
  ChevronRight,
  Settings2,
} from 'lucide-react'
import { requireProfile } from '@/lib/auth'
import { isAdminRole } from '@/lib/types'
import { getDashboardStats } from '@/lib/queries/dashboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { BrandLogo } from '@/components/brand-logo'

export default async function HomePage() {
  const [profile, stats] = await Promise.all([
    requireProfile(),
    getDashboardStats(),
  ])
  const admin = isAdminRole(profile.role)
  const firstName = profile.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col">
      {/* Slim brand header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <BrandLogo size="sm" />
        {admin && (
          <Link
            href="/admin"
            aria-label="Pengaturan admin"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Settings2 className="size-5" aria-hidden="true" />
          </Link>
        )}
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        {/* Welcome intro */}
        <section>
          <p className="text-sm text-muted-foreground">
            {firstName ? `Halo, ${firstName}` : 'Selamat datang'}
          </p>
          <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-balance">
            Selamat datang di Gudang Talenta
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
            Kelola dan pantau persediaan gudang dengan mudah.
          </p>
        </section>

        {/* Statistics */}
        <section aria-labelledby="stat-heading">
          <h3 id="stat-heading" className="sr-only">
            Ringkasan gudang
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Jenis Barang"
              value={stats.totalProducts}
              icon={Package}
              tone="primary"
            />
            <StatCard
              label="Kategori"
              value={stats.totalCategories}
              icon={Tags}
              tone="neutral"
            />
            <StatCard
              label="Gudang"
              value={stats.totalWarehouses}
              icon={WarehouseIcon}
              tone="neutral"
            />
            <StatCard
              label="Rak"
              value={stats.totalRacks}
              icon={Grid3x3}
              tone="neutral"
            />
          </div>
        </section>

        {/* Recent activity */}
        <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 id="activity-heading" className="text-base font-semibold">
              Aktivitas Terbaru
            </h3>
            <Link
              href="/aktivitas"
              className="flex items-center gap-0.5 text-sm font-medium text-primary"
            >
              Lihat semua
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ClipboardList className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm font-medium">Belum ada aktivitas</p>
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">
              Transaksi barang masuk dan keluar akan muncul di sini.
            </p>
          </div>
        </section>

        {/* Low stock */}
        <section aria-labelledby="lowstock-heading" className="flex flex-col gap-3">
          <h3 id="lowstock-heading" className="text-base font-semibold">
            Stok Menipis
          </h3>
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm font-medium">Semua stok aman</p>
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">
              Barang dengan stok di bawah ambang batas akan ditampilkan di sini.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

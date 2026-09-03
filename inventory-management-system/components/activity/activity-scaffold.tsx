'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const filters = [
  { key: 'all', label: 'Semua' },
  { key: 'in', label: 'Barang Masuk' },
  { key: 'out', label: 'Barang Keluar' },
  { key: 'adjust', label: 'Koreksi' },
] as const

export function ActivityScaffold() {
  const [active, setActive] = useState<(typeof filters)[number]['key']>('all')

  return (
    <div className="flex flex-col">
      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f.key)}
            aria-pressed={active === f.key}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              active === f.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <ClipboardList className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-1 text-sm font-medium">Belum ada transaksi</p>
          <p className="max-w-xs text-sm text-muted-foreground text-pretty">
            Histori barang masuk, barang keluar, dan koreksi stok akan tampil di
            sini beserta detail lengkapnya.
          </p>
        </div>
      </div>
    </div>
  )
}

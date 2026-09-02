'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, X, PackageSearch, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductImage } from '@/components/product-image'
import type { ProductSpecification } from '@/lib/types'

type SearchProduct = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: { id: string; name: string } | null
  unit: { id: string; name: string; abbreviation: string | null } | null
  product_specifications: ProductSpecification[]
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function SearchClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounced(query.trim(), 250)

  // Autofocus + open the mobile keyboard on entry.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    let active = true
    if (debouncedQuery.length < 1) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const run = async () => {
      const supabase = createClient()
      const term = debouncedQuery.replace(/[%,]/g, '')
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, description, image_url, category:categories(id,name), unit:units(id,name,abbreviation), product_specifications(id,product_id,spec_key,spec_value,spec_unit,sort_order,created_at)',
        )
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(40)

      if (!active) return
      if (error) {
        console.error('[v0] Search error:', error)
        setResults([])
      } else {
        setResults((data as unknown as SearchProduct[]) ?? [])
      }
      setLoading(false)
    }
    run()
    return () => {
      active = false
    }
  }, [debouncedQuery])

  // Rank name matches ahead of description-only matches.
  const ranked = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    if (!q) return results
    return [...results].sort((a, b) => {
      const an = a.name.toLowerCase()
      const bn = b.name.toLowerCase()
      const aStarts = an.startsWith(q) ? 0 : an.includes(q) ? 1 : 2
      const bStarts = bn.startsWith(q) ? 0 : bn.includes(q) ? 1 : 2
      if (aStarts !== bStarts) return aStarts - bStarts
      return an.localeCompare(bn)
    })
  }, [results, debouncedQuery])

  const showEmptyPrompt = debouncedQuery.length === 0
  const showNoResults =
    !loading && debouncedQuery.length > 0 && ranked.length === 0

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, kategori, spesifikasi..."
            aria-label="Cari barang"
            enterKeyHint="search"
            className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-10 text-base outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {showEmptyPrompt && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <PackageSearch className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground text-pretty max-w-xs">
              Cari barang berdasarkan nama, kategori, spesifikasi, atau lokasi.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Mencari...
          </div>
        )}

        {showNoResults && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <PackageSearch className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm font-medium">Barang tidak ditemukan</p>
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">
              Coba gunakan nama atau kata kunci lain.
            </p>
          </div>
        )}

        {!loading && ranked.length > 0 && (
          <ul className="flex flex-col gap-3">
            {ranked.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/barang/${p.id}`}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-secondary/50"
                >
                  <ProductImage
                    src={p.image_url}
                    alt={p.name}
                    className="size-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-tight">
                      {p.name}
                    </p>
                    {p.category && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.category.name}
                      </p>
                    )}
                    {p.product_specifications.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {[...p.product_specifications]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .slice(0, 3)
                          .map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                            >
                              {s.spec_key}: {s.spec_value}
                              {s.spec_unit ? ` ${s.spec_unit}` : ''}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

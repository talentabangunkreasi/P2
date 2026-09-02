import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
  totalProducts: number
  totalCategories: number
  totalWarehouses: number
  totalRacks: number
}

/**
 * Master-data snapshot for the Home dashboard. Stock movement metrics
 * (total stok, barang masuk/keluar) are wired up once the inventory
 * transaction engine (Phase 3) lands.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [products, categories, warehouses, racks] = await Promise.all([
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('warehouses')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('racks')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalWarehouses: warehouses.count ?? 0,
    totalRacks: racks.count ?? 0,
  }
}

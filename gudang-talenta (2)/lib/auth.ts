import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminRole, type Profile } from '@/lib/types'

/**
 * Returns the current user's profile, or null if not authenticated.
 * The profile row (including role) is the server-side source of truth for
 * authorization — never trust a role sent from the client.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, created_at, updated_at')
    .eq('id', user.id)
    .single()

  return (data as Profile) ?? null
}

/** Require an authenticated, active user. Redirects to login otherwise. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')
  if (!profile.is_active) redirect('/auth/nonaktif')
  return profile
}

/**
 * Require an admin (admin or super_admin). Server-side authorization guard used
 * by every admin Server Action and admin page. Throws for actions; use
 * requireAdminPage for pages that should redirect.
 */
export async function assertAdmin(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile || !profile.is_active) {
    throw new Error('UNAUTHORIZED')
  }
  if (!isAdminRole(profile.role)) {
    throw new Error('FORBIDDEN')
  }
  return profile
}

/** Page-level admin guard: redirects non-admins to home. */
export async function requireAdminPage(): Promise<Profile> {
  const profile = await requireProfile()
  if (!isAdminRole(profile.role)) redirect('/')
  return profile
}

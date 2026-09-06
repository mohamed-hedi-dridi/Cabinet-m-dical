import "server-only"

import { forbidden, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Profile, UserRole } from "@/types"

export interface CurrentUser {
  id: string
  email: string
  profile: Profile | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? "",
    profile,
  }
}

/**
 * Protège une page ou une server action réservée à certains rôles. Renvoie
 * l'utilisateur courant si son rôle est autorisé, sinon affiche la page 403
 * (`app/forbidden.tsx`). L'authentification elle-même est déjà garantie par
 * `app/(dashboard)/layout.tsx` (redirection vers /login) ; ce garde ne fait
 * que compléter le filtrage de la navigation par un contrôle côté route.
 * La sécurité réelle reste assurée par les policies RLS de chaque table.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (!user.profile || !allowedRoles.includes(user.profile.role)) {
    forbidden()
  }

  return user
}

import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types"

export async function listUsers(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getUserById(id: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

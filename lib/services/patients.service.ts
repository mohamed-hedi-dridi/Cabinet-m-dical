import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Patient } from "@/types"

export async function listPatients(search?: string): Promise<Patient[]> {
  const supabase = await createClient()

  let query = supabase
    .from("patients")
    .select("*")
    .order("last_name", { ascending: true })

  if (search) {
    const term = search.trim()
    query = query.or(
      `last_name.ilike.%${term}%,first_name.ilike.%${term}%,phone.ilike.%${term}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

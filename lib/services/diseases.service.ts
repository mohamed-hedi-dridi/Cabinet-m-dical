import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Disease } from "@/types"

export async function listDiseases(
  search?: string,
  category?: string
): Promise<Disease[]> {
  const supabase = await createClient()

  let query = supabase.from("diseases").select("*").order("name")

  if (search) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function listDiseaseCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("diseases")
    .select("category")
    .not("category", "is", null)

  if (error) throw error

  const categories = new Set(
    (data ?? [])
      .map((row) => row.category)
      .filter((category): category is string => Boolean(category))
  )

  return Array.from(categories).sort()
}

export async function getDiseaseById(id: string): Promise<Disease | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("diseases")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

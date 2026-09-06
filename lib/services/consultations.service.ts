import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Appointment, Consultation, Doctor, Patient, Profile } from "@/types"

export type ConsultationWithRelations = Consultation & {
  patient: Patient
  doctor: Doctor & { profile: Profile }
  appointment: Appointment | null
}

export interface ConsultationFilters {
  patientId?: string
  doctorId?: string
  dateFrom?: string
  dateTo?: string
}

const SELECT_WITH_RELATIONS =
  "*, patient:patients(*), doctor:doctors(*, profile:profiles(*)), appointment:appointments(*)"

export async function listConsultations(
  filters: ConsultationFilters = {}
): Promise<ConsultationWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from("consultations")
    .select(SELECT_WITH_RELATIONS)
    .order("consultation_date", { ascending: false })

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId)
  }
  if (filters.doctorId) {
    query = query.eq("doctor_id", filters.doctorId)
  }
  if (filters.dateFrom) {
    query = query.gte("consultation_date", filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte("consultation_date", filters.dateTo)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as unknown as ConsultationWithRelations[]
}

export async function getConsultationById(
  id: string
): Promise<ConsultationWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consultations")
    .select(SELECT_WITH_RELATIONS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as ConsultationWithRelations | null
}

export async function listRecentConsultations(
  limit = 5
): Promise<ConsultationWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consultations")
    .select(SELECT_WITH_RELATIONS)
    .order("consultation_date", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as ConsultationWithRelations[]
}

export async function countConsultationsThisMonth(): Promise<number> {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { count, error } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .gte("consultation_date", startOfMonth.toISOString())

  if (error) throw error
  return count ?? 0
}

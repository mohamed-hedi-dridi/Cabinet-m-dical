import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Appointment, AppointmentStatus, Doctor, Patient, Profile } from "@/types"

export type AppointmentWithRelations = Appointment & {
  patient: Patient
  doctor: Doctor & { profile: Profile }
}

export interface AppointmentFilters {
  search?: string
  patientId?: string
  doctorId?: string
  status?: AppointmentStatus
  dateFrom?: string
  dateTo?: string
}

export async function listAppointments(
  filters: AppointmentFilters = {}
): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from("appointments")
    .select("*, patient:patients(*), doctor:doctors(*, profile:profiles(*))")
    .order("start_at", { ascending: false })

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId)
  }
  if (filters.doctorId) {
    query = query.eq("doctor_id", filters.doctorId)
  }
  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.dateFrom) {
    query = query.gte("start_at", filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte("start_at", filters.dateTo)
  }
  if (filters.search) {
    const term = filters.search.trim()
    query = query.or(`reason.ilike.%${term}%,notes.ilike.%${term}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as unknown as AppointmentWithRelations[]
}

export async function getAppointmentById(
  id: string
): Promise<AppointmentWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("*, patient:patients(*), doctor:doctors(*, profile:profiles(*))")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as AppointmentWithRelations | null
}

export async function listTodayAppointments(): Promise<
  AppointmentWithRelations[]
> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  return listAppointments({
    dateFrom: startOfDay.toISOString(),
    dateTo: endOfDay.toISOString(),
  })
}

export async function listUpcomingAppointments(
  limit = 5
): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("*, patient:patients(*), doctor:doctors(*, profile:profiles(*))")
    .gte("start_at", new Date().toISOString())
    .in("status", ["PLANNED", "CONFIRMED"])
    .order("start_at", { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as AppointmentWithRelations[]
}

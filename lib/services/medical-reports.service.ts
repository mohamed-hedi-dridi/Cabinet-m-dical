import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Doctor, MedicalReport, Patient, Profile } from "@/types"

export type MedicalReportWithRelations = MedicalReport & {
  patient: Patient
  doctor: (Doctor & { profile: Profile }) | null
}

export interface MedicalReportFilters {
  patientId?: string
  reportType?: string
  dateFrom?: string
  dateTo?: string
}

const SELECT_WITH_RELATIONS =
  "*, patient:patients(*), doctor:doctors(*, profile:profiles(*))"

export async function listMedicalReports(
  filters: MedicalReportFilters = {}
): Promise<MedicalReportWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from("medical_reports")
    .select(SELECT_WITH_RELATIONS)
    .order("report_date", { ascending: false })

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId)
  }
  if (filters.reportType) {
    query = query.eq("report_type", filters.reportType)
  }
  if (filters.dateFrom) {
    query = query.gte("report_date", filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte("report_date", filters.dateTo)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as unknown as MedicalReportWithRelations[]
}

export async function getMedicalReportById(
  id: string
): Promise<MedicalReportWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("medical_reports")
    .select(SELECT_WITH_RELATIONS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as MedicalReportWithRelations | null
}

export async function listRecentMedicalReports(
  limit = 5
): Promise<MedicalReportWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("medical_reports")
    .select(SELECT_WITH_RELATIONS)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as MedicalReportWithRelations[]
}

export async function getMedicalReportDownloadUrl(
  filePath: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from("medical-reports")
    .createSignedUrl(filePath, 60)

  if (error) return null
  return data.signedUrl
}

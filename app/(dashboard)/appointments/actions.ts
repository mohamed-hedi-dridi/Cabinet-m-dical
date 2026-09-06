"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  appointmentSchema,
  toAppointmentRecord,
  type AppointmentInput,
} from "@/schemas/appointment.schema"
import type { AppointmentStatus } from "@/types"

export interface AppointmentActionState {
  error?: string
  success?: boolean
}

export async function createAppointment(
  values: AppointmentInput
): Promise<AppointmentActionState> {
  const parsed = appointmentSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("appointments")
    .insert(toAppointmentRecord(parsed.data))

  if (error) {
    return { error: "Impossible de créer le rendez-vous" }
  }

  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAppointment(
  id: string,
  values: AppointmentInput
): Promise<AppointmentActionState> {
  const parsed = appointmentSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("appointments")
    .update(toAppointmentRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier le rendez-vous" }
  }

  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<AppointmentActionState> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)

  if (error) {
    return { error: "Impossible de changer le statut" }
  }

  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteAppointment(
  id: string
): Promise<AppointmentActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from("appointments").delete().eq("id", id)

  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Impossible de supprimer ce rendez-vous : une consultation y est associée"
          : "Impossible de supprimer le rendez-vous",
    }
  }

  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}

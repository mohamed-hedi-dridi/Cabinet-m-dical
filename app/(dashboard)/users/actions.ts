"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/services/auth.service"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type CreateUserInput,
  type ResetPasswordInput,
  type UpdateUserInput,
} from "@/schemas/user.schema"

export interface UserActionState {
  error?: string
  success?: boolean
}

export async function createUser(
  values: CreateUserInput
): Promise<UserActionState> {
  await requireRole(["ADMIN"])

  const parsed = createUserSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  })

  if (error) {
    return {
      error:
        error.code === "email_exists"
          ? "Un compte existe déjà avec cet email"
          : "Impossible de créer l'utilisateur",
    }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function updateUser(
  id: string,
  values: UpdateUserInput
): Promise<UserActionState> {
  const currentUser = await requireRole(["ADMIN"])

  const parsed = updateUserSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (id === currentUser.id && parsed.data.role !== "ADMIN") {
    return { error: "Vous ne pouvez pas modifier votre propre rôle" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    })
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier l'utilisateur" }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function toggleUserActive(
  id: string,
  isActive: boolean
): Promise<UserActionState> {
  const currentUser = await requireRole(["ADMIN"])

  if (id === currentUser.id) {
    return { error: "Vous ne pouvez pas désactiver votre propre compte" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier le statut de l'utilisateur" }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function resetUserPassword(
  id: string,
  values: ResetPasswordInput
): Promise<UserActionState> {
  await requireRole(["ADMIN"])

  const parsed = resetPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsed.data.password,
  })

  if (error) {
    return { error: "Impossible de réinitialiser le mot de passe" }
  }

  return { success: true }
}

export async function deleteUser(id: string): Promise<UserActionState> {
  const currentUser = await requireRole(["ADMIN"])

  if (id === currentUser.id) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte" }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) {
    return {
      error:
        "Impossible de supprimer cet utilisateur : il est probablement associé à une fiche médecin, des rendez-vous ou des consultations",
    }
  }

  revalidatePath("/users")
  return { success: true }
}

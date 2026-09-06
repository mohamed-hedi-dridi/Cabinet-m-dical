import { z } from "zod"

export const USER_ROLES = ["ADMIN", "DOCTOR", "SECRETARY"] as const

export const createUserSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est obligatoire"),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(USER_ROLES),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est obligatoire"),
  role: z.enum(USER_ROLES),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

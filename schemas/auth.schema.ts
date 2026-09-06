import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est obligatoire").email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

export type LoginInput = z.infer<typeof loginSchema>

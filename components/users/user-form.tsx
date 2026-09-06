"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { UserActionState } from "@/app/(dashboard)/users/actions"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserSchema,
  updateUserSchema,
  USER_ROLES,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/schemas/user.schema"
import type { Profile } from "@/types"

export const ROLE_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  ADMIN: "Administrateur",
  DOCTOR: "Médecin",
  SECRETARY: "Secrétaire",
}

export function UserForm({
  user,
  onSubmit,
  onSuccess,
}: {
  user?: Profile | null
  onSubmit: (
    values: CreateUserInput | UpdateUserInput
  ) => Promise<UserActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? { full_name: user.full_name, role: user.role }
      : { full_name: "", email: "", password: "", role: "SECRETARY" },
  })

  function handleSubmit(values: CreateUserInput | UpdateUserInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) {
        setServerError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  const errors = form.formState.errors as Record<
    string,
    { message?: string } | undefined
  >

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="full_name">Nom complet *</FieldLabel>
          <Input
            id="full_name"
            disabled={isPending}
            {...form.register("full_name")}
          />
          <FieldError errors={[errors.full_name]} />
        </Field>

        {!user && (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                type="email"
                disabled={isPending}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mot de passe *</FieldLabel>
              <Input
                id="password"
                type="password"
                disabled={isPending}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
          </>
        )}

        <Field>
          <FieldLabel htmlFor="role">Rôle *</FieldLabel>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.role]} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {user ? "Enregistrer" : "Créer l'utilisateur"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

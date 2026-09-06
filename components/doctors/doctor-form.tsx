"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { DoctorActionState } from "@/app/(dashboard)/doctors/actions"
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
import { doctorSchema, type DoctorInput } from "@/schemas/doctor.schema"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { Profile } from "@/types"

export function DoctorForm({
  doctor,
  availableProfiles,
  onSubmit,
  onSuccess,
}: {
  doctor?: DoctorWithProfile | null
  availableProfiles: Profile[]
  onSubmit: (values: DoctorInput) => Promise<DoctorActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DoctorInput>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      profile_id: doctor?.profile_id ?? "",
      speciality: doctor?.speciality ?? "",
      phone: doctor?.phone ?? "",
    },
  })

  function handleSubmit(values: DoctorInput) {
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

  const noProfilesAvailable = !doctor && availableProfiles.length === 0

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile_id">Profil *</FieldLabel>
          <Controller
            control={form.control}
            name="profile_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending || !!doctor || noProfilesAvailable}
              >
                <SelectTrigger id="profile_id" className="w-full">
                  <SelectValue placeholder="Sélectionner un profil médecin" />
                </SelectTrigger>
                <SelectContent>
                  {doctor && (
                    <SelectItem value={doctor.profile_id}>
                      {doctor.profile.full_name}
                    </SelectItem>
                  )}
                  {availableProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name} ({profile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.profile_id]} />
          {noProfilesAvailable && (
            <p className="text-sm text-muted-foreground">
              Aucun profil avec le rôle Médecin n&apos;est disponible. Créez
              d&apos;abord un utilisateur avec ce rôle.
            </p>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="speciality">Spécialité</FieldLabel>
            <Input
              id="speciality"
              disabled={isPending}
              {...form.register("speciality")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
            <Input
              id="phone"
              disabled={isPending}
              {...form.register("phone")}
            />
          </Field>
        </div>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="submit"
            disabled={isPending || noProfilesAvailable}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {doctor ? "Enregistrer" : "Créer le médecin"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

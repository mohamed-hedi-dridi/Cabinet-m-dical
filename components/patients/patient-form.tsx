"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { PatientActionState } from "@/app/(dashboard)/patients/actions"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { patientSchema, type PatientInput } from "@/schemas/patient.schema"
import type { Patient } from "@/types"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

function toDefaultValues(patient?: Patient | null): PatientInput {
  return {
    first_name: patient?.first_name ?? "",
    last_name: patient?.last_name ?? "",
    gender: patient?.gender ?? "",
    birth_date: patient?.birth_date ?? "",
    weight_kg: patient?.weight_kg?.toString() ?? "",
    height_cm: patient?.height_cm?.toString() ?? "",
    blood_group: patient?.blood_group ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    allergies: patient?.allergies ?? "",
    medical_history: patient?.medical_history ?? "",
    chronic_diseases: patient?.chronic_diseases ?? "",
  }
}

export function PatientForm({
  patient,
  onSubmit,
}: {
  patient?: Patient | null
  onSubmit: (values: PatientInput) => Promise<PatientActionState>
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: toDefaultValues(patient),
  })

  function handleSubmit(values: PatientInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="last_name">Nom *</FieldLabel>
            <Input
              id="last_name"
              disabled={isPending}
              {...form.register("last_name")}
            />
            <FieldError errors={[form.formState.errors.last_name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="first_name">Prénom *</FieldLabel>
            <Input
              id="first_name"
              disabled={isPending}
              {...form.register("first_name")}
            />
            <FieldError errors={[form.formState.errors.first_name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="gender">Sexe</FieldLabel>
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="birth_date">Date de naissance</FieldLabel>
            <Input
              id="birth_date"
              type="date"
              disabled={isPending}
              {...form.register("birth_date")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="weight_kg">Poids (kg)</FieldLabel>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              disabled={isPending}
              {...form.register("weight_kg")}
            />
            <FieldError errors={[form.formState.errors.weight_kg]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="height_cm">Taille (cm)</FieldLabel>
            <Input
              id="height_cm"
              type="number"
              step="0.1"
              disabled={isPending}
              {...form.register("height_cm")}
            />
            <FieldError errors={[form.formState.errors.height_cm]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="blood_group">Groupe sanguin</FieldLabel>
            <Controller
              control={form.control}
              name="blood_group"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="blood_group" className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
            <Input
              id="phone"
              type="tel"
              disabled={isPending}
              {...form.register("phone")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              disabled={isPending}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="address">Adresse</FieldLabel>
            <Input
              id="address"
              disabled={isPending}
              {...form.register("address")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="allergies">Allergies</FieldLabel>
          <Textarea
            id="allergies"
            disabled={isPending}
            {...form.register("allergies")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="medical_history">Antécédents</FieldLabel>
          <Textarea
            id="medical_history"
            disabled={isPending}
            {...form.register("medical_history")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="chronic_diseases">
            Maladies chroniques
          </FieldLabel>
          <Textarea
            id="chronic_diseases"
            disabled={isPending}
            {...form.register("chronic_diseases")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {patient ? "Enregistrer" : "Créer le patient"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}

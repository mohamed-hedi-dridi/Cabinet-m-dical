"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { PatientDiseaseActionState } from "@/app/(dashboard)/patients/diseases-actions"
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
import { Textarea } from "@/components/ui/textarea"
import {
  patientDiseaseSchema,
  type PatientDiseaseInput,
} from "@/schemas/patient-disease.schema"
import type { Disease, PatientDisease } from "@/types"

const STATUS_LABELS = {
  ACTIVE: "Active",
  RESOLVED: "Résolue",
  CHRONIC: "Chronique",
} as const

export function PatientDiseaseForm({
  patientDisease,
  diseases,
  onSubmit,
  onSuccess,
}: {
  patientDisease?: PatientDisease | null
  diseases: Disease[]
  onSubmit: (values: PatientDiseaseInput) => Promise<PatientDiseaseActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<PatientDiseaseInput>({
    resolver: zodResolver(patientDiseaseSchema),
    defaultValues: {
      disease_id: patientDisease?.disease_id ?? "",
      diagnosed_at: patientDisease?.diagnosed_at ?? "",
      status: patientDisease?.status ?? "ACTIVE",
      notes: patientDisease?.notes ?? "",
    },
  })

  function handleSubmit(values: PatientDiseaseInput) {
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

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="disease_id">Maladie *</FieldLabel>
          <Controller
            control={form.control}
            name="disease_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending || !!patientDisease}
              >
                <SelectTrigger id="disease_id" className="w-full">
                  <SelectValue placeholder="Sélectionner une maladie" />
                </SelectTrigger>
                <SelectContent>
                  {diseases.map((disease) => (
                    <SelectItem key={disease.id} value={disease.id}>
                      {disease.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.disease_id]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="diagnosed_at">
              Date de diagnostic
            </FieldLabel>
            <Input
              id="diagnosed_at"
              type="date"
              disabled={isPending}
              {...form.register("diagnosed_at")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="status">Statut</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea
            id="notes"
            disabled={isPending}
            {...form.register("notes")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {patientDisease ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

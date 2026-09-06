"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { MedicalNoteActionState } from "@/app/(dashboard)/patients/medical-notes-actions"
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
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { MedicalNoteWithRelations } from "@/lib/services/medical-notes.service"
import {
  medicalNoteSchema,
  type MedicalNoteInput,
} from "@/schemas/medical-note.schema"

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MedicalNoteForm({
  note,
  doctors,
  consultations,
  defaultDoctorId,
  onSubmit,
  onSuccess,
}: {
  note?: MedicalNoteWithRelations | null
  doctors: DoctorWithProfile[]
  consultations: ConsultationWithRelations[]
  defaultDoctorId?: string
  onSubmit: (values: MedicalNoteInput) => Promise<MedicalNoteActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<MedicalNoteInput>({
    resolver: zodResolver(medicalNoteSchema),
    defaultValues: {
      doctor_id: note?.doctor_id ?? defaultDoctorId ?? "",
      consultation_id: note?.consultation_id ?? "",
      title: note?.title ?? "",
      content: note?.content ?? "",
      note_date: note
        ? toDatetimeLocal(note.note_date)
        : toDatetimeLocal(new Date().toISOString()),
    },
  })

  function handleSubmit(values: MedicalNoteInput) {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="doctor_id">Médecin *</FieldLabel>
            <Controller
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="doctor_id" className="w-full">
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.doctor_id]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="note_date">Date *</FieldLabel>
            <Input
              id="note_date"
              type="datetime-local"
              disabled={isPending}
              {...form.register("note_date")}
            />
            <FieldError errors={[form.formState.errors.note_date]} />
          </Field>
        </div>

        {consultations.length > 0 && (
          <Field>
            <FieldLabel htmlFor="consultation_id">
              Consultation associée
            </FieldLabel>
            <Controller
              control={form.control}
              name="consultation_id"
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="consultation_id" className="w-full">
                    <SelectValue placeholder="Aucune consultation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune consultation</SelectItem>
                    {consultations.map((consultation) => (
                      <SelectItem key={consultation.id} value={consultation.id}>
                        {new Date(
                          consultation.consultation_date
                        ).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        {consultation.reason ? ` — ${consultation.reason}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="title">Titre</FieldLabel>
          <Input id="title" disabled={isPending} {...form.register("title")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="content">Note *</FieldLabel>
          <Textarea
            id="content"
            rows={5}
            disabled={isPending}
            {...form.register("content")}
          />
          <FieldError errors={[form.formState.errors.content]} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {note ? "Enregistrer" : "Ajouter la note"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

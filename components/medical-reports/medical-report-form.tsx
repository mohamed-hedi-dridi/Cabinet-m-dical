"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { MedicalReportActionState } from "@/app/(dashboard)/medical-reports/actions"
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
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { MedicalReportWithRelations } from "@/lib/services/medical-reports.service"
import {
  medicalReportSchema,
  type MedicalReportInput,
} from "@/schemas/medical-report.schema"
import type { Patient } from "@/types"

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

export function MedicalReportForm({
  report,
  patients,
  doctors,
  consultations,
  lockedPatientId,
  lockedConsultationId,
  onSubmit,
}: {
  report?: MedicalReportWithRelations | null
  patients: Patient[]
  doctors: DoctorWithProfile[]
  consultations: ConsultationWithRelations[]
  lockedPatientId?: string
  lockedConsultationId?: string
  onSubmit: (
    values: MedicalReportInput,
    file: File | null
  ) => Promise<MedicalReportActionState>
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const patientLocked = Boolean(lockedPatientId || report)
  const consultationLocked = Boolean(lockedConsultationId)

  const form = useForm<MedicalReportInput>({
    resolver: zodResolver(medicalReportSchema),
    defaultValues: {
      patient_id: report?.patient_id ?? lockedPatientId ?? "",
      doctor_id: report?.doctor_id ?? "",
      consultation_id: report?.consultation_id ?? lockedConsultationId ?? "",
      title: report?.title ?? "",
      report_type: report?.report_type ?? "",
      description: report?.description ?? "",
      report_date: report
        ? toDateInput(report.report_date)
        : toDateInput(new Date().toISOString()),
    },
  })

  function handleSubmit(values: MedicalReportInput) {
    setServerError(null)
    if (!report && (!file || file.size === 0)) {
      setServerError("Le document est obligatoire")
      return
    }
    startTransition(async () => {
      const result = await onSubmit(values, file)
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
            <FieldLabel htmlFor="patient_id">Patient *</FieldLabel>
            <Controller
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending || patientLocked}
                >
                  <SelectTrigger id="patient_id" className="w-full">
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.last_name} {patient.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.patient_id]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="doctor_id">Médecin</FieldLabel>
            <Controller
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="doctor_id" className="w-full">
                    <SelectValue placeholder="Aucun médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun médecin</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
                  disabled={isPending || consultationLocked}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="title">Titre *</FieldLabel>
            <Input id="title" disabled={isPending} {...form.register("title")} />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="report_type">Type</FieldLabel>
            <Input
              id="report_type"
              placeholder="Bilan sanguin, radiologique…"
              disabled={isPending}
              {...form.register("report_type")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="report_date">Date *</FieldLabel>
          <Input
            id="report_date"
            type="date"
            disabled={isPending}
            className="max-w-xs"
            {...form.register("report_date")}
          />
          <FieldError errors={[form.formState.errors.report_date]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            disabled={isPending}
            {...form.register("description")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="file">
            Document {report ? "" : "*"}
          </FieldLabel>
          {report?.file_path && (
            <p className="text-sm text-muted-foreground">
              Un document est déjà associé à ce bilan. Sélectionnez un
              fichier pour le remplacer.
            </p>
          )}
          <Input
            id="file"
            type="file"
            accept="application/pdf,image/*"
            disabled={isPending}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
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
            {report ? "Enregistrer" : "Créer le bilan"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}

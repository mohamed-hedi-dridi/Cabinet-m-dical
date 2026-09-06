import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FileText, Pencil } from "lucide-react"

import { DeleteConsultationButton } from "@/components/consultations/delete-consultation-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/services/auth.service"
import { getConsultationById } from "@/lib/services/consultations.service"

export async function generateMetadata({
  params,
}: PageProps<"/consultations/[id]">): Promise<Metadata> {
  const { id } = await params
  const consultation = await getConsultationById(id)
  return {
    title: consultation
      ? `Consultation — ${consultation.patient.first_name} ${consultation.patient.last_name}`
      : "Consultation introuvable",
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  })
}

export default async function ConsultationDetailPage({
  params,
}: PageProps<"/consultations/[id]">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const { id } = await params
  const consultation = await getConsultationById(id)

  if (!consultation) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Consultation du {formatDateTime(consultation.consultation_date)}
          </h1>
          <p className="text-muted-foreground">
            <Link
              href={`/patients/${consultation.patient.id}`}
              className="hover:underline"
            >
              {consultation.patient.last_name}{" "}
              {consultation.patient.first_name}
            </Link>{" "}
            — Dr. {consultation.doctor.profile.full_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/medical-reports/new?patientId=${consultation.patient.id}&consultationId=${consultation.id}`}
            >
              <FileText />
              Ajouter un bilan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/consultations/${consultation.id}/edit`}>
              <Pencil />
              Modifier
            </Link>
          </Button>
          <DeleteConsultationButton
            consultationId={consultation.id}
            redirectTo="/consultations"
          />
        </div>
      </div>

      {consultation.appointment && (
        <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
          Issue du rendez-vous du{" "}
          {formatDateTime(consultation.appointment.start_at)}.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Motif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.reason ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Symptômes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.symptoms ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Examen clinique</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.clinical_examination ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.diagnosis ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.treatment ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes médicales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {consultation.medical_notes ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

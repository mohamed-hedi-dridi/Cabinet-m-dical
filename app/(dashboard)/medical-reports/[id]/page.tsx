import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, Pencil } from "lucide-react"

import { DeleteMedicalReportButton } from "@/components/medical-reports/delete-medical-report-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/services/auth.service"
import {
  getMedicalReportById,
  getMedicalReportDownloadUrl,
} from "@/lib/services/medical-reports.service"

export async function generateMetadata({
  params,
}: PageProps<"/medical-reports/[id]">): Promise<Metadata> {
  const { id } = await params
  const report = await getMedicalReportById(id)
  return {
    title: report ? `${report.title} — Cabinet Médical` : "Bilan introuvable",
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long" })
}

export default async function MedicalReportDetailPage({
  params,
}: PageProps<"/medical-reports/[id]">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const { id } = await params
  const report = await getMedicalReportById(id)

  if (!report) {
    notFound()
  }

  const downloadUrl = report.file_path
    ? await getMedicalReportDownloadUrl(report.file_path)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{report.title}</h1>
          <p className="text-muted-foreground">
            <Link
              href={`/patients/${report.patient.id}`}
              className="hover:underline"
            >
              {report.patient.last_name} {report.patient.first_name}
            </Link>{" "}
            — {formatDate(report.report_date)}
            {report.doctor ? ` — Dr. ${report.doctor.profile.full_name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {downloadUrl && (
            <Button variant="outline" asChild>
              <a href={downloadUrl} target="_blank" rel="noreferrer">
                <Download />
                Télécharger
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/medical-reports/${report.id}/edit`}>
              <Pencil />
              Modifier
            </Link>
          </Button>
          <DeleteMedicalReportButton
            reportId={report.id}
            redirectTo="/medical-reports"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {report.description ?? "—"}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{report.report_type ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultation associée</CardTitle>
          </CardHeader>
          <CardContent>
            {report.consultation_id ? (
              <Link
                href={`/consultations/${report.consultation_id}`}
                className="text-sm hover:underline"
              >
                Voir la consultation
              </Link>
            ) : (
              <p className="text-sm">—</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

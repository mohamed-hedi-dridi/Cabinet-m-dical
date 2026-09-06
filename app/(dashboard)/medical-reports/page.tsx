import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Plus } from "lucide-react"

import { DeleteMedicalReportButton } from "@/components/medical-reports/delete-medical-report-button"
import { MedicalReportsFilters } from "@/components/medical-reports/medical-reports-filters"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireRole } from "@/lib/services/auth.service"
import { listMedicalReports } from "@/lib/services/medical-reports.service"
import { listPatients } from "@/lib/services/patients.service"

export const metadata: Metadata = {
  title: "Bilans médicaux — Cabinet Médical",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR")
}

export default async function MedicalReportsPage({
  searchParams,
}: PageProps<"/medical-reports">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const params = await searchParams
  const patientId = typeof params.patient === "string" ? params.patient : ""
  const reportType = typeof params.type === "string" ? params.type : ""
  const date = typeof params.date === "string" ? params.date : ""

  const [allReports, patients] = await Promise.all([
    listMedicalReports(),
    listPatients(),
  ])

  const reportTypes = Array.from(
    new Set(
      allReports
        .map((report) => report.report_type)
        .filter((type): type is string => Boolean(type))
    )
  ).sort()

  const reports = allReports.filter((report) => {
    if (patientId && report.patient_id !== patientId) return false
    if (reportType && report.report_type !== reportType) return false
    if (date && report.report_date !== date) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bilans médicaux</h1>
          <p className="text-muted-foreground">
            {reports.length} bilan{reports.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/medical-reports/new">
            <Plus />
            Nouveau bilan
          </Link>
        </Button>
      </div>

      <MedicalReportsFilters
        defaultPatientId={patientId}
        defaultReportType={reportType}
        defaultDate={date}
        patients={patients}
        reportTypes={reportTypes}
      />

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <FileText className="size-8" />
          <p>
            {patientId || reportType || date
              ? "Aucun bilan ne correspond à votre recherche."
              : "Aucun bilan médical enregistré pour le moment."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{formatDate(report.report_date)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/medical-reports/${report.id}`}
                      className="hover:underline"
                    >
                      {report.patient.last_name} {report.patient.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.report_type ?? "—"}</TableCell>
                  <TableCell>
                    {report.doctor ? `Dr. ${report.doctor.profile.full_name}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/medical-reports/${report.id}`}>Voir</Link>
                      </Button>
                      <DeleteMedicalReportButton reportId={report.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MedicalReportWithRelations } from "@/lib/services/medical-reports.service"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR")
}

export function PatientMedicalReportsTab({
  patientId,
  reports,
}: {
  patientId: string
  reports: MedicalReportWithRelations[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" asChild>
          <Link href={`/medical-reports/new?patientId=${patientId}`}>
            <Plus />
            Nouveau bilan
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aucun bilan médical enregistré pour ce patient.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/medical-reports/${report.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {report.title}
                      {report.report_type ? ` — ${report.report_type}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.report_date)}
                      {report.doctor
                        ? ` — Dr. ${report.doctor.profile.full_name}`
                        : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

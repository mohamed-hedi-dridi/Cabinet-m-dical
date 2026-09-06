import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function PatientConsultationsTab({
  patientId,
  consultations,
}: {
  patientId: string
  consultations: ConsultationWithRelations[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" asChild>
          <Link href={`/consultations/new?patientId=${patientId}`}>
            <Plus />
            Nouvelle consultation
          </Link>
        </Button>
      </div>

      {consultations.length === 0 ? (
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aucune consultation enregistrée pour ce patient.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {consultations.map((consultation) => (
            <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {formatDateTime(consultation.consultation_date)} — Dr.{" "}
                      {consultation.doctor.profile.full_name}
                    </p>
                    {consultation.reason && (
                      <p className="text-sm text-muted-foreground">
                        {consultation.reason}
                      </p>
                    )}
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

import { Pencil, Plus } from "lucide-react"

import { PatientDiseaseDialog } from "@/components/patients/patient-disease-dialog"
import { RemovePatientDiseaseButton } from "@/components/patients/remove-patient-disease-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PatientDiseaseWithDisease } from "@/lib/services/patient-diseases.service"
import type { Disease } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  RESOLVED: "Résolue",
  CHRONIC: "Chronique",
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  ACTIVE: "default",
  CHRONIC: "secondary",
  RESOLVED: "outline",
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString("fr-FR")
}

export function PatientDiseasesTab({
  patientId,
  patientDiseases,
  diseases,
}: {
  patientId: string
  patientDiseases: PatientDiseaseWithDisease[]
  diseases: Disease[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <PatientDiseaseDialog
          patientId={patientId}
          diseases={diseases}
          trigger={
            <Button size="sm">
              <Plus />
              Ajouter une maladie
            </Button>
          }
        />
      </div>

      {patientDiseases.length === 0 ? (
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aucune maladie diagnostiquée pour ce patient.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {patientDiseases.map((patientDisease) => (
            <Card key={patientDisease.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {patientDisease.disease.name}
                    </p>
                    <Badge variant={STATUS_VARIANTS[patientDisease.status]}>
                      {STATUS_LABELS[patientDisease.status]}
                    </Badge>
                  </div>
                  {formatDate(patientDisease.diagnosed_at) && (
                    <p className="text-sm text-muted-foreground">
                      Diagnostiquée le{" "}
                      {formatDate(patientDisease.diagnosed_at)}
                    </p>
                  )}
                  {patientDisease.notes && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {patientDisease.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <PatientDiseaseDialog
                    patientId={patientId}
                    patientDisease={patientDisease}
                    diseases={diseases}
                    trigger={
                      <Button variant="outline" size="icon-sm" title="Modifier">
                        <Pencil />
                        <span className="sr-only">Modifier</span>
                      </Button>
                    }
                  />
                  <RemovePatientDiseaseButton
                    id={patientDisease.id}
                    patientId={patientId}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

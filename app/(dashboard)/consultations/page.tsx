import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Stethoscope } from "lucide-react"

import { ConsultationsFilters } from "@/components/consultations/consultations-filters"
import { DeleteConsultationButton } from "@/components/consultations/delete-consultation-button"
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
import { listConsultations } from "@/lib/services/consultations.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listPatients } from "@/lib/services/patients.service"

export const metadata: Metadata = {
  title: "Consultations — Cabinet Médical",
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export default async function ConsultationsPage({
  searchParams,
}: PageProps<"/consultations">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const params = await searchParams
  const patientId = typeof params.patient === "string" ? params.patient : ""
  const doctorId = typeof params.doctor === "string" ? params.doctor : ""
  const date = typeof params.date === "string" ? params.date : ""

  let dateFrom: string | undefined
  let dateTo: string | undefined
  if (date) {
    const start = new Date(`${date}T00:00:00`)
    const end = new Date(`${date}T23:59:59.999`)
    dateFrom = start.toISOString()
    dateTo = end.toISOString()
  }

  const [consultations, patients, doctors] = await Promise.all([
    listConsultations({
      patientId: patientId || undefined,
      doctorId: doctorId || undefined,
      dateFrom,
      dateTo,
    }),
    listPatients(),
    listDoctors(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Consultations</h1>
          <p className="text-muted-foreground">
            {consultations.length} consultation
            {consultations.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/consultations/new">
            <Plus />
            Nouvelle consultation
          </Link>
        </Button>
      </div>

      <ConsultationsFilters
        defaultPatientId={patientId}
        defaultDoctorId={doctorId}
        defaultDate={date}
        patients={patients}
        doctors={doctors}
      />

      {consultations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Stethoscope className="size-8" />
          <p>
            {patientId || doctorId || date
              ? "Aucune consultation ne correspond à votre recherche."
              : "Aucune consultation enregistrée pour le moment."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>
                    {formatDateTime(consultation.consultation_date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="hover:underline"
                    >
                      {consultation.patient.last_name}{" "}
                      {consultation.patient.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    Dr. {consultation.doctor.profile.full_name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {consultation.reason ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/consultations/${consultation.id}`}>
                          Voir
                        </Link>
                      </Button>
                      <DeleteConsultationButton
                        consultationId={consultation.id}
                      />
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

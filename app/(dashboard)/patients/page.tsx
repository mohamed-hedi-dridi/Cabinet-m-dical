import type { Metadata } from "next"
import Link from "next/link"
import { Pencil, Plus, Users } from "lucide-react"

import { DeletePatientButton } from "@/components/patients/delete-patient-button"
import { PatientsSearch } from "@/components/patients/patients-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listPatients } from "@/lib/services/patients.service"

export const metadata: Metadata = {
  title: "Patients — Cabinet Médical",
}

function formatAge(birthDate: string | null): string | null {
  if (!birthDate) return null
  const diff = Date.now() - new Date(birthDate).getTime()
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  return `${age} ans`
}

export default async function PatientsPage({
  searchParams,
}: PageProps<"/patients">) {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  const patients = await listPatients(q)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-muted-foreground">
            {patients.length} patient{patients.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <Plus />
            Nouveau patient
          </Link>
        </Button>
      </div>

      <PatientsSearch defaultValue={q} />

      {patients.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Users className="size-8" />
          <p>
            {q
              ? "Aucun patient ne correspond à votre recherche."
              : "Aucun patient enregistré pour le moment."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Groupe sanguin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="hover:underline"
                    >
                      {patient.last_name} {patient.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {patient.gender === "M"
                      ? "Masculin"
                      : patient.gender === "F"
                        ? "Féminin"
                        : "—"}
                  </TableCell>
                  <TableCell>{formatAge(patient.birth_date) ?? "—"}</TableCell>
                  <TableCell>{patient.phone ?? "—"}</TableCell>
                  <TableCell>
                    {patient.blood_group ? (
                      <Badge variant="outline">{patient.blood_group}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        asChild
                        title="Modifier"
                      >
                        <Link href={`/patients/${patient.id}/edit`}>
                          <Pencil />
                          <span className="sr-only">Modifier</span>
                        </Link>
                      </Button>
                      <DeletePatientButton
                        patientId={patient.id}
                        patientName={`${patient.first_name} ${patient.last_name}`}
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

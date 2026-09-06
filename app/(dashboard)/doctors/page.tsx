import type { Metadata } from "next"
import { Pencil, Plus, UsersRound } from "lucide-react"

import { DeleteDoctorButton } from "@/components/doctors/delete-doctor-button"
import { DoctorDialog } from "@/components/doctors/doctor-dialog"
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
import { requireRole } from "@/lib/services/auth.service"
import {
  listAvailableDoctorProfiles,
  listDoctors,
} from "@/lib/services/doctors.service"

export const metadata: Metadata = {
  title: "Médecins — Cabinet Médical",
}

export default async function DoctorsPage() {
  await requireRole(["ADMIN"])

  const [doctors, availableProfiles] = await Promise.all([
    listDoctors(),
    listAvailableDoctorProfiles(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Médecins</h1>
          <p className="text-muted-foreground">
            Annuaire des médecins — {doctors.length} médecin
            {doctors.length > 1 ? "s" : ""}
          </p>
        </div>
        <DoctorDialog
          availableProfiles={availableProfiles}
          trigger={
            <Button>
              <Plus />
              Nouveau médecin
            </Button>
          }
        />
      </div>

      {doctors.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <UsersRound className="size-8" />
          <p>Aucun médecin enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    Dr. {doctor.profile.full_name}
                  </TableCell>
                  <TableCell>{doctor.profile.email}</TableCell>
                  <TableCell>
                    {doctor.speciality ? (
                      <Badge variant="outline">{doctor.speciality}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{doctor.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DoctorDialog
                        doctor={doctor}
                        availableProfiles={availableProfiles}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            title="Modifier"
                          >
                            <Pencil />
                            <span className="sr-only">Modifier</span>
                          </Button>
                        }
                      />
                      <DeleteDoctorButton
                        doctorId={doctor.id}
                        doctorName={doctor.profile.full_name}
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

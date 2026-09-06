import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Pencil, Plus, Stethoscope } from "lucide-react"

import { AppointmentDialog } from "@/components/appointments/appointment-dialog"
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select"
import { AppointmentsCalendar } from "@/components/appointments/appointments-calendar"
import { AppointmentsFilters } from "@/components/appointments/appointments-filters"
import { DeleteAppointmentButton } from "@/components/appointments/delete-appointment-button"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { listAppointments } from "@/lib/services/appointments.service"
import { getCurrentUser } from "@/lib/services/auth.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listPatients } from "@/lib/services/patients.service"
import type { AppointmentStatus } from "@/types"

export const metadata: Metadata = {
  title: "Rendez-vous — Cabinet Médical",
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export default async function AppointmentsPage({
  searchParams,
}: PageProps<"/appointments">) {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  const patientId = typeof params.patient === "string" ? params.patient : ""
  const doctorId = typeof params.doctor === "string" ? params.doctor : ""
  const status =
    typeof params.status === "string"
      ? (params.status as AppointmentStatus)
      : ""
  const date = typeof params.date === "string" ? params.date : ""

  let dateFrom: string | undefined
  let dateTo: string | undefined
  if (date) {
    const start = new Date(`${date}T00:00:00`)
    const end = new Date(`${date}T23:59:59.999`)
    dateFrom = start.toISOString()
    dateTo = end.toISOString()
  }

  const [appointments, patients, doctors, currentUser] = await Promise.all([
    listAppointments({
      search: q || undefined,
      patientId: patientId || undefined,
      doctorId: doctorId || undefined,
      status: status || undefined,
      dateFrom,
      dateTo,
    }),
    listPatients(),
    listDoctors(),
    getCurrentUser(),
  ])

  const canCreateConsultation =
    currentUser?.profile?.role === "ADMIN" ||
    currentUser?.profile?.role === "DOCTOR"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rendez-vous</h1>
          <p className="text-muted-foreground">
            {appointments.length} rendez-vous
            {appointments.length > 1 ? "s" : ""}
          </p>
        </div>
        <AppointmentDialog
          patients={patients}
          doctors={doctors}
          trigger={
            <Button>
              <Plus />
              Nouveau rendez-vous
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="liste">
        <TabsList>
          <TabsTrigger value="liste">Liste</TabsTrigger>
          <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="flex flex-col gap-4">
          <AppointmentsFilters
            defaultSearch={q}
            defaultPatientId={patientId}
            defaultDoctorId={doctorId}
            defaultStatus={status}
            defaultDate={date}
            patients={patients}
            doctors={doctors}
          />

          {appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              <CalendarDays className="size-8" />
              <p>
                {q || patientId || doctorId || status || date
                  ? "Aucun rendez-vous ne correspond à votre recherche."
                  : "Aucun rendez-vous enregistré pour le moment."}
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
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {formatDateTime(appointment.start_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {appointment.patient.last_name}{" "}
                        {appointment.patient.first_name}
                      </TableCell>
                      <TableCell>
                        Dr. {appointment.doctor.profile.full_name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {appointment.reason ?? "—"}
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusSelect
                          appointmentId={appointment.id}
                          status={appointment.status}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {appointment.status === "COMPLETED" &&
                            canCreateConsultation && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              title="Créer une consultation"
                              asChild
                            >
                              <Link
                                href={`/consultations/new?appointmentId=${appointment.id}`}
                              >
                                <Stethoscope />
                                <span className="sr-only">
                                  Créer une consultation
                                </span>
                              </Link>
                            </Button>
                          )}
                          <AppointmentDialog
                            appointment={appointment}
                            patients={patients}
                            doctors={doctors}
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
                          <DeleteAppointmentButton
                            appointmentId={appointment.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendrier">
          <AppointmentsCalendar
            appointments={appointments}
            patients={patients}
            doctors={doctors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

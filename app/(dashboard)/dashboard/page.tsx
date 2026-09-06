import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Stethoscope,
  StickyNote,
  Users,
  UsersRound,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentUser } from "@/lib/services/auth.service"
import {
  listUpcomingAppointments,
  listTodayAppointments,
} from "@/lib/services/appointments.service"
import {
  countConsultationsThisMonth,
  listRecentConsultations,
} from "@/lib/services/consultations.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listRecentMedicalNotes } from "@/lib/services/medical-notes.service"
import { listRecentMedicalReports } from "@/lib/services/medical-reports.service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Dashboard — Cabinet Médical",
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const role = user?.profile?.role
  const canSeeClinicalData = role === "ADMIN" || role === "DOCTOR"
  const isAdmin = role === "ADMIN"

  const supabase = await createClient()

  const [
    { count: patientsCount },
    todayAppointments,
    upcomingAppointments,
    doctors,
    consultationsThisMonth,
    recentConsultations,
    recentReports,
    recentNotes,
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    listTodayAppointments(),
    listUpcomingAppointments(5),
    isAdmin ? listDoctors() : Promise.resolve([]),
    canSeeClinicalData ? countConsultationsThisMonth() : Promise.resolve(0),
    canSeeClinicalData ? listRecentConsultations(5) : Promise.resolve([]),
    canSeeClinicalData ? listRecentMedicalReports(5) : Promise.resolve([]),
    canSeeClinicalData ? listRecentMedicalNotes(5) : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Bonjour {user?.profile?.full_name} 👋
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu rapide de l&apos;activité du cabinet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Patients
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rendez-vous aujourd&apos;hui
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayAppointments.length}
            </div>
          </CardContent>
        </Card>

        {canSeeClinicalData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultations ce mois
              </CardTitle>
              <Stethoscope className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consultationsThisMonth}
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Médecins
              </CardTitle>
              <UsersRound className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun rendez-vous à venir.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="text-sm">
                    <Link
                      href="/appointments"
                      className="font-medium hover:underline"
                    >
                      {appointment.patient.first_name}{" "}
                      {appointment.patient.last_name}
                    </Link>
                    <p className="text-muted-foreground">
                      {formatDateTime(appointment.start_at)} — Dr.{" "}
                      {appointment.doctor.profile.full_name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {canSeeClinicalData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="size-4" />
                Dernières consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentConsultations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune consultation récente.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {recentConsultations.map((consultation) => (
                    <li key={consultation.id} className="text-sm">
                      <Link
                        href={`/consultations/${consultation.id}`}
                        className="font-medium hover:underline"
                      >
                        {consultation.patient.first_name}{" "}
                        {consultation.patient.last_name}
                      </Link>
                      <p className="text-muted-foreground">
                        {formatDate(consultation.consultation_date)} — Dr.{" "}
                        {consultation.doctor.profile.full_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {canSeeClinicalData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Derniers bilans médicaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun bilan récent.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {recentReports.map((report) => (
                    <li key={report.id} className="text-sm">
                      <Link
                        href={`/medical-reports/${report.id}`}
                        className="font-medium hover:underline"
                      >
                        {report.title}
                      </Link>
                      <p className="text-muted-foreground">
                        {formatDate(report.report_date)} —{" "}
                        {report.patient.first_name} {report.patient.last_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {canSeeClinicalData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="size-4" />
                Dernières notes médicales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune note récente.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {recentNotes.map((note) => (
                    <li key={note.id} className="text-sm">
                      <Link
                        href={`/patients/${note.patient_id}`}
                        className="font-medium hover:underline"
                      >
                        {note.title || "Note médicale"}
                      </Link>
                      <p className="text-muted-foreground">
                        {formatDate(note.note_date)} — Dr.{" "}
                        {note.doctor.profile.full_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4" />
                Liens rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/doctors" className="hover:underline">
                    Gérer les médecins
                  </Link>
                </li>
                <li>
                  <Link href="/diseases" className="hover:underline">
                    Gérer le référentiel des maladies
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

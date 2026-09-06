import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"

import { DeletePatientButton } from "@/components/patients/delete-patient-button"
import { PatientConsultationsTab } from "@/components/patients/patient-consultations-tab"
import { PatientDiseasesTab } from "@/components/patients/patient-diseases-tab"
import { PatientMedicalNotesTab } from "@/components/patients/patient-medical-notes-tab"
import { PatientMedicalReportsTab } from "@/components/patients/patient-medical-reports-tab"
import { PatientHistoryTab } from "@/components/patients/patient-history-tab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/services/auth.service"
import { listConsultations } from "@/lib/services/consultations.service"
import { listDiseases } from "@/lib/services/diseases.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listMedicalNotesForPatient } from "@/lib/services/medical-notes.service"
import { listMedicalReports } from "@/lib/services/medical-reports.service"
import { listPatientDiseases } from "@/lib/services/patient-diseases.service"
import { listPatientHistory } from "@/lib/services/patient-history.service"
import { getPatientById } from "@/lib/services/patients.service"

export async function generateMetadata({
  params,
}: PageProps<"/patients/[id]">): Promise<Metadata> {
  const { id } = await params
  const patient = await getPatientById(id)
  return {
    title: patient
      ? `${patient.first_name} ${patient.last_name} — Cabinet Médical`
      : "Patient introuvable",
  }
}

const GENDER_LABELS: Record<string, string> = {
  M: "Masculin",
  F: "Féminin",
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("fr-FR")
}

export default async function PatientDetailPage({
  params,
}: PageProps<"/patients/[id]">) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  const [
    patientDiseases,
    diseases,
    consultations,
    medicalReports,
    medicalNotes,
    doctors,
    currentUser,
    history,
  ] = await Promise.all([
    listPatientDiseases(patient.id),
    listDiseases(),
    listConsultations({ patientId: patient.id }),
    listMedicalReports({ patientId: patient.id }),
    listMedicalNotesForPatient(patient.id),
    listDoctors(),
    getCurrentUser(),
    listPatientHistory(patient.id),
  ])

  const currentDoctorId = doctors.find(
    (doctor) => doctor.profile_id === currentUser?.id
  )?.id

  // La secrétaire n'a accès qu'aux informations administratives du patient
  // (voir cahier des charges section 4/17) : maladies, consultations, bilans,
  // notes médicales et historique restent réservés à ADMIN + DOCTOR.
  const canSeeClinicalData =
    currentUser?.profile?.role === "ADMIN" ||
    currentUser?.profile?.role === "DOCTOR"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {patient.last_name} {patient.first_name}
          </h1>
          <p className="text-muted-foreground">Fiche patient</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <Pencil />
              Modifier
            </Link>
          </Button>
          <DeletePatientButton
            patientId={patient.id}
            patientName={`${patient.first_name} ${patient.last_name}`}
          />
        </div>
      </div>

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          {canSeeClinicalData && (
            <>
              <TabsTrigger value="diseases">
                Maladies ({patientDiseases.length})
              </TabsTrigger>
              <TabsTrigger value="consultations">
                Consultations ({consultations.length})
              </TabsTrigger>
              <TabsTrigger value="reports">
                Bilans ({medicalReports.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes médicales ({medicalNotes.length})
              </TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="informations">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sexe</p>
                  <p>
                    {patient.gender ? GENDER_LABELS[patient.gender] : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de naissance</p>
                  <p>{formatDate(patient.birth_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Poids</p>
                  <p>{patient.weight_kg ? `${patient.weight_kg} kg` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taille</p>
                  <p>{patient.height_cm ? `${patient.height_cm} cm` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Groupe sanguin</p>
                  <p>
                    {patient.blood_group ? (
                      <Badge variant="outline">{patient.blood_group}</Badge>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Téléphone</p>
                  <p>{patient.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{patient.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Adresse</p>
                  <p>{patient.address ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique médical</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Allergies</p>
                  <p className="whitespace-pre-wrap">
                    {patient.allergies ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Antécédents</p>
                  <p className="whitespace-pre-wrap">
                    {patient.medical_history ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Maladies chroniques
                  </p>
                  <p className="whitespace-pre-wrap">
                    {patient.chronic_diseases ?? "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canSeeClinicalData && (
          <>
            <TabsContent value="diseases">
              <PatientDiseasesTab
                patientId={patient.id}
                patientDiseases={patientDiseases}
                diseases={diseases}
              />
            </TabsContent>

            <TabsContent value="consultations">
              <PatientConsultationsTab
                patientId={patient.id}
                consultations={consultations}
              />
            </TabsContent>

            <TabsContent value="reports">
              <PatientMedicalReportsTab
                patientId={patient.id}
                reports={medicalReports}
              />
            </TabsContent>

            <TabsContent value="notes">
              <PatientMedicalNotesTab
                patientId={patient.id}
                notes={medicalNotes}
                doctors={doctors}
                consultations={consultations}
                defaultDoctorId={currentDoctorId}
              />
            </TabsContent>

            <TabsContent value="history">
              <PatientHistoryTab events={history} doctors={doctors} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

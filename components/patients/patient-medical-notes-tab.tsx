import { Pencil, Plus } from "lucide-react"

import { DeleteMedicalNoteButton } from "@/components/patients/delete-medical-note-button"
import { MedicalNoteDialog } from "@/components/patients/medical-note-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { MedicalNoteWithRelations } from "@/lib/services/medical-notes.service"

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function PatientMedicalNotesTab({
  patientId,
  notes,
  doctors,
  consultations,
  defaultDoctorId,
}: {
  patientId: string
  notes: MedicalNoteWithRelations[]
  doctors: DoctorWithProfile[]
  consultations: ConsultationWithRelations[]
  defaultDoctorId?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <MedicalNoteDialog
          patientId={patientId}
          doctors={doctors}
          consultations={consultations}
          defaultDoctorId={defaultDoctorId}
          trigger={
            <Button size="sm">
              <Plus />
              Ajouter une note
            </Button>
          }
        />
      </div>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aucune note médicale enregistrée pour ce patient.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(note.note_date)} — Dr.{" "}
                    {note.doctor.profile.full_name}
                  </p>
                  {note.title && <p className="font-medium">{note.title}</p>}
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <MedicalNoteDialog
                    patientId={patientId}
                    note={note}
                    doctors={doctors}
                    consultations={consultations}
                    trigger={
                      <Button variant="outline" size="icon-sm" title="Modifier">
                        <Pencil />
                        <span className="sr-only">Modifier</span>
                      </Button>
                    }
                  />
                  <DeleteMedicalNoteButton
                    noteId={note.id}
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

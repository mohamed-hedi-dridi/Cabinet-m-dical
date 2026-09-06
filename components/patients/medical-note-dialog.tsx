"use client"

import { useState } from "react"

import {
  addMedicalNote,
  updateMedicalNote,
} from "@/app/(dashboard)/patients/medical-notes-actions"
import { MedicalNoteForm } from "@/components/patients/medical-note-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { MedicalNoteWithRelations } from "@/lib/services/medical-notes.service"

export function MedicalNoteDialog({
  patientId,
  note,
  doctors,
  consultations,
  defaultDoctorId,
  trigger,
}: {
  patientId: string
  note?: MedicalNoteWithRelations | null
  doctors: DoctorWithProfile[]
  consultations: ConsultationWithRelations[]
  defaultDoctorId?: string
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {note ? "Modifier la note" : "Ajouter une note médicale"}
          </DialogTitle>
        </DialogHeader>
        <MedicalNoteForm
          note={note}
          doctors={doctors}
          consultations={consultations}
          defaultDoctorId={defaultDoctorId}
          onSubmit={
            note
              ? (values) => updateMedicalNote(note.id, patientId, values)
              : (values) => addMedicalNote(patientId, values)
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

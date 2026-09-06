"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ClipboardList,
  FileText,
  Stethoscope,
  StickyNote,
} from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import {
  PATIENT_HISTORY_EVENT_TYPES,
  type PatientHistoryEvent,
  type PatientHistoryEventType,
} from "@/lib/types/patient-history"

const TYPE_LABELS: Record<PatientHistoryEventType, string> = {
  CONSULTATION: "Consultation",
  DISEASE: "Maladie",
  MEDICAL_REPORT: "Bilan médical",
  MEDICAL_NOTE: "Note médicale",
}

const TYPE_ICONS: Record<PatientHistoryEventType, typeof Stethoscope> = {
  CONSULTATION: Stethoscope,
  DISEASE: ClipboardList,
  MEDICAL_REPORT: FileText,
  MEDICAL_NOTE: StickyNote,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long" })
}

export function PatientHistoryTab({
  events,
  doctors,
}: {
  events: PatientHistoryEvent[]
  doctors: DoctorWithProfile[]
}) {
  const [type, setType] = useState<string>("all")
  const [date, setDate] = useState<string>("")
  const [doctorId, setDoctorId] = useState<string>("all")

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (type !== "all" && event.type !== type) return false
      if (date && !event.date.startsWith(date)) return false
      if (doctorId !== "all" && event.doctorId !== doctorId) return false
      return true
    })
  }, [events, type, date, doctorId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PATIENT_HISTORY_EVENT_TYPES.map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {TYPE_LABELS[eventType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={doctorId} onValueChange={setDoctorId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les médecins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les médecins</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.profile.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-40"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aucun événement ne correspond à votre recherche.
        </p>
      ) : (
        <ol className="flex flex-col gap-4 border-l pl-6">
          {filteredEvents.map((event) => {
            const Icon = TYPE_ICONS[event.type]
            const content = (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" />
                  <span>{formatDate(event.date)}</span>
                  <span>—</span>
                  <span>{TYPE_LABELS[event.type]}</span>
                  {event.doctorName && (
                    <>
                      <span>—</span>
                      <span>Dr. {event.doctorName}</span>
                    </>
                  )}
                </div>
                <p className="font-medium">{event.title}</p>
                {event.description && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            )

            return (
              <li key={`${event.type}-${event.id}`} className="relative">
                <span className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-primary" />
                {event.href ? (
                  <Link href={event.href} className="hover:underline">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction"
import type { EventClickArg } from "@fullcalendar/core"
import frLocale from "@fullcalendar/core/locales/fr"

import { AppointmentDialog } from "@/components/appointments/appointment-dialog"
import type { AppointmentWithRelations } from "@/lib/services/appointments.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { Patient } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "var(--color-muted-foreground)",
  CONFIRMED: "var(--color-primary)",
  COMPLETED: "var(--color-primary)",
  CANCELLED: "var(--color-destructive)",
  ABSENT: "var(--color-destructive)",
}

export function AppointmentsCalendar({
  appointments,
  patients,
  doctors,
}: {
  appointments: AppointmentWithRelations[]
  patients: Patient[]
  doctors: DoctorWithProfile[]
}) {
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(
    null
  )
  const [range, setRange] = useState<{ start: string; end: string } | null>(
    null
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.patient.last_name} ${appointment.patient.first_name} — Dr. ${appointment.doctor.profile.full_name}`,
    start: appointment.start_at,
    end: appointment.end_at,
    color: STATUS_COLORS[appointment.status],
  }))

  function handleEventClick(info: EventClickArg) {
    const appointment = appointments.find((a) => a.id === info.event.id)
    if (!appointment) return
    setSelected(appointment)
    setRange(null)
    setDialogOpen(true)
  }

  function handleDateClick(info: DateClickArg) {
    const start = new Date(info.date)
    const end = new Date(start.getTime() + 30 * 60 * 1000)
    setSelected(null)
    setRange({
      start: toDatetimeLocal(start),
      end: toDatetimeLocal(end),
    })
    setDialogOpen(true)
  }

  return (
    <div className="rounded-xl border p-2 [--fc-border-color:var(--color-border)] [--fc-page-bg-color:transparent] [--fc-today-bg-color:var(--color-muted)]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        initialView="timeGridWeek"
        locale={frLocale}
        height="auto"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        selectable
      />

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selected}
        patients={patients}
        doctors={doctors}
        defaultStart={range?.start}
        defaultEnd={range?.end}
      />
    </div>
  )
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

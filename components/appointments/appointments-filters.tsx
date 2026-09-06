"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { APPOINTMENT_STATUS_LABELS } from "@/components/appointments/appointment-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import { APPOINTMENT_STATUSES } from "@/schemas/appointment.schema"
import type { Patient } from "@/types"

export function AppointmentsFilters({
  defaultSearch,
  defaultPatientId,
  defaultDoctorId,
  defaultStatus,
  defaultDate,
  patients,
  doctors,
}: {
  defaultSearch: string
  defaultPatientId: string
  defaultDoctorId: string
  defaultStatus: string
  defaultDate: string
  patients: Patient[]
  doctors: DoctorWithProfile[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(defaultSearch)
  const [, startTransition] = useTransition()

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    startTransition(() => {
      router.replace(`/appointments?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            updateParams({ q: event.target.value })
          }}
          placeholder="Rechercher (motif, notes)…"
          className="pl-8"
        />
      </div>

      <Select
        value={defaultPatientId || "all"}
        onValueChange={(value) =>
          updateParams({ patient: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tous les patients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les patients</SelectItem>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.last_name} {patient.first_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={defaultDoctorId || "all"}
        onValueChange={(value) =>
          updateParams({ doctor: value === "all" ? "" : value })
        }
      >
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

      <Select
        value={defaultStatus || "all"}
        onValueChange={(value) =>
          updateParams({ status: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {APPOINTMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {APPOINTMENT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={defaultDate}
        onChange={(event) => updateParams({ date: event.target.value })}
        className="w-40"
      />
    </div>
  )
}

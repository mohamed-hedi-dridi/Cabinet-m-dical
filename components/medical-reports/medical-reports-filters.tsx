"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Patient } from "@/types"

export function MedicalReportsFilters({
  defaultPatientId,
  defaultReportType,
  defaultDate,
  patients,
  reportTypes,
}: {
  defaultPatientId: string
  defaultReportType: string
  defaultDate: string
  patients: Patient[]
  reportTypes: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    startTransition(() => {
      router.replace(`/medical-reports?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
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

      {reportTypes.length > 0 && (
        <Select
          value={defaultReportType || "all"}
          onValueChange={(value) =>
            updateParams({ type: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {reportTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        type="date"
        value={defaultDate}
        onChange={(event) => updateParams({ date: event.target.value })}
        className="w-40"
      />
    </div>
  )
}

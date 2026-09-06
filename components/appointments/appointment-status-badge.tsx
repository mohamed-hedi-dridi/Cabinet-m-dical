import { Badge } from "@/components/ui/badge"
import { APPOINTMENT_STATUS_LABELS } from "@/components/appointments/appointment-form"
import type { AppointmentStatus } from "@/types"

const STATUS_VARIANTS: Record<
  AppointmentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANNED: "outline",
  CONFIRMED: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
  ABSENT: "destructive",
}

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus
}) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

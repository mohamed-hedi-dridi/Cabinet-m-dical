"use client"

import { useTransition } from "react"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { removePatientDisease } from "@/app/(dashboard)/patients/diseases-actions"
import { Button } from "@/components/ui/button"

export function RemovePatientDiseaseButton({
  id,
  patientId,
}: {
  id: string
  patientId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removePatientDisease(id, patientId)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title="Retirer"
      disabled={isPending}
      onClick={handleRemove}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <X />}
      <span className="sr-only">Retirer</span>
    </Button>
  )
}

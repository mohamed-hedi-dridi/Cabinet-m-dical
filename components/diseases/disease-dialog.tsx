"use client"

import { useState } from "react"

import { createDisease, updateDisease } from "@/app/(dashboard)/diseases/actions"
import { DiseaseForm } from "@/components/diseases/disease-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Disease } from "@/types"

export function DiseaseDialog({
  disease,
  trigger,
}: {
  disease?: Disease | null
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {disease ? "Modifier la maladie" : "Nouvelle maladie"}
          </DialogTitle>
        </DialogHeader>
        <DiseaseForm
          disease={disease}
          onSubmit={
            disease
              ? (values) => updateDisease(disease.id, values)
              : createDisease
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

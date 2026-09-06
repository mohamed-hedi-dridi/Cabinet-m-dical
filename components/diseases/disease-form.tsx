"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import type { DiseaseActionState } from "@/app/(dashboard)/diseases/actions"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { diseaseSchema, type DiseaseInput } from "@/schemas/disease.schema"
import type { Disease } from "@/types"

export function DiseaseForm({
  disease,
  onSubmit,
  onSuccess,
}: {
  disease?: Disease | null
  onSubmit: (values: DiseaseInput) => Promise<DiseaseActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DiseaseInput>({
    resolver: zodResolver(diseaseSchema),
    defaultValues: {
      name: disease?.name ?? "",
      code: disease?.code ?? "",
      category: disease?.category ?? "",
      description: disease?.description ?? "",
    },
  })

  function handleSubmit(values: DiseaseInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) {
        setServerError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nom *</FieldLabel>
          <Input id="name" disabled={isPending} {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="code">Code</FieldLabel>
            <Input id="code" disabled={isPending} {...form.register("code")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="category">Catégorie</FieldLabel>
            <Input
              id="category"
              disabled={isPending}
              {...form.register("category")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            disabled={isPending}
            {...form.register("description")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {disease ? "Enregistrer" : "Créer la maladie"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

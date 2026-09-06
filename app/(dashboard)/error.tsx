"use client"

import { AlertTriangle } from "lucide-react"

import { ErrorPage } from "@/components/errors/error-page"

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <ErrorPage
      icon={AlertTriangle}
      code="500"
      title="Une erreur est survenue"
      description={
        error.digest
          ? `Une erreur inattendue s'est produite (référence : ${error.digest}).`
          : "Une erreur inattendue s'est produite. Veuillez réessayer."
      }
    />
  )
}

import { ShieldAlert } from "lucide-react"

import { ErrorPage } from "@/components/errors/error-page"

export default function Forbidden() {
  return (
    <ErrorPage
      icon={ShieldAlert}
      code="403"
      title="Accès refusé"
      description="Vous n'avez pas les autorisations nécessaires pour accéder à cette page."
    />
  )
}

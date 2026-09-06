import { SearchX } from "lucide-react"

import { ErrorPage } from "@/components/errors/error-page"

export default function NotFound() {
  return (
    <ErrorPage
      icon={SearchX}
      code="404"
      title="Page introuvable"
      description="La page que vous recherchez n'existe pas ou a été déplacée."
    />
  )
}

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ErrorPage({
  icon: Icon,
  code,
  title,
  description,
}: {
  icon: LucideIcon
  code: string
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <Icon className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Erreur {code}
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button asChild className="mt-2">
        <Link href="/dashboard">Retour au dashboard</Link>
      </Button>
    </div>
  )
}

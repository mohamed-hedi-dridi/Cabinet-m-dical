"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function PatientsSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [, startTransition] = useTransition()

  function handleChange(next: string) {
    setValue(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next) {
      params.set("q", next)
    } else {
      params.delete("q")
    }
    startTransition(() => {
      router.replace(`/patients?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Rechercher par nom, prénom ou téléphone…"
        className="pl-8"
      />
    </div>
  )
}

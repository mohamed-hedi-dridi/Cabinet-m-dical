"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DiseasesFilters({
  defaultSearch,
  defaultCategory,
  categories,
}: {
  defaultSearch: string
  defaultCategory: string
  categories: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(defaultSearch)
  const [, startTransition] = useTransition()

  function updateParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString())

    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q)
      else params.delete("q")
    }

    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category)
      else params.delete("category")
    }

    startTransition(() => {
      router.replace(`/diseases?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            updateParams({ q: event.target.value })
          }}
          placeholder="Rechercher une maladie…"
          className="pl-8"
        />
      </div>

      <Select
        value={defaultCategory || "all"}
        onValueChange={(value) =>
          updateParams({ category: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Toutes les catégories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les catégories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

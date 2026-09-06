import type { Metadata } from "next"
import { ClipboardList, Pencil, Plus } from "lucide-react"

import { DeleteDiseaseButton } from "@/components/diseases/delete-disease-button"
import { DiseaseDialog } from "@/components/diseases/disease-dialog"
import { DiseasesFilters } from "@/components/diseases/diseases-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireRole } from "@/lib/services/auth.service"
import {
  listDiseaseCategories,
  listDiseases,
} from "@/lib/services/diseases.service"

export const metadata: Metadata = {
  title: "Maladies — Cabinet Médical",
}

export default async function DiseasesPage({
  searchParams,
}: PageProps<"/diseases">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  const category = typeof params.category === "string" ? params.category : ""

  const [diseases, categories] = await Promise.all([
    listDiseases(q, category),
    listDiseaseCategories(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Maladies</h1>
          <p className="text-muted-foreground">
            Référentiel des maladies — {diseases.length} maladie
            {diseases.length > 1 ? "s" : ""}
          </p>
        </div>
        <DiseaseDialog
          trigger={
            <Button>
              <Plus />
              Nouvelle maladie
            </Button>
          }
        />
      </div>

      <DiseasesFilters
        defaultSearch={q}
        defaultCategory={category}
        categories={categories}
      />

      {diseases.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <ClipboardList className="size-8" />
          <p>
            {q || category
              ? "Aucune maladie ne correspond à votre recherche."
              : "Aucune maladie enregistrée pour le moment."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diseases.map((disease) => (
                <TableRow key={disease.id}>
                  <TableCell className="font-medium">
                    {disease.name}
                  </TableCell>
                  <TableCell>{disease.code ?? "—"}</TableCell>
                  <TableCell>
                    {disease.category ? (
                      <Badge variant="outline">{disease.category}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {disease.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DiseaseDialog
                        disease={disease}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            title="Modifier"
                          >
                            <Pencil />
                            <span className="sr-only">Modifier</span>
                          </Button>
                        }
                      />
                      <DeleteDiseaseButton
                        diseaseId={disease.id}
                        diseaseName={disease.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

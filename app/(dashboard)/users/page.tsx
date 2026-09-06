import type { Metadata } from "next"
import { Pencil, Plus, UserCog } from "lucide-react"

import { DeleteUserButton } from "@/components/users/delete-user-button"
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog"
import { ToggleUserActiveSwitch } from "@/components/users/toggle-user-active-switch"
import { UserDialog } from "@/components/users/user-dialog"
import { ROLE_LABELS } from "@/components/users/user-form"
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
import { getCurrentUser, requireRole } from "@/lib/services/auth.service"
import { listUsers } from "@/lib/services/users.service"

export const metadata: Metadata = {
  title: "Utilisateurs — Cabinet Médical",
}

export default async function UsersPage() {
  await requireRole(["ADMIN"])

  const [users, currentUser] = await Promise.all([
    listUsers(),
    getCurrentUser(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Comptes de l&apos;application — {users.length} utilisateur
            {users.length > 1 ? "s" : ""}
          </p>
        </div>
        <UserDialog
          trigger={
            <Button>
              <Plus />
              Nouvel utilisateur
            </Button>
          }
        />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <UserCog className="size-8" />
          <p>Aucun utilisateur enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (vous)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ToggleUserActiveSwitch
                        userId={user.id}
                        isActive={user.is_active}
                        disabled={isSelf}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <UserDialog
                          user={user}
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
                        <ResetPasswordDialog
                          userId={user.id}
                          userName={user.full_name}
                        />
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.full_name}
                          disabled={isSelf}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

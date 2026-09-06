"use client"

import { useState } from "react"

import {
  createUser,
  updateUser,
  type UserActionState,
} from "@/app/(dashboard)/users/actions"
import { UserForm } from "@/components/users/user-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema"
import type { Profile } from "@/types"

export function UserDialog({
  user,
  trigger,
}: {
  user?: Profile | null
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={
            (user
              ? (values: UpdateUserInput) => updateUser(user.id, values)
              : (values: CreateUserInput) => createUser(values)) as (
              values: CreateUserInput | UpdateUserInput
            ) => Promise<UserActionState>
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

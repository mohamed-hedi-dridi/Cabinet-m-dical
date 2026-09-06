"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { toggleUserActive } from "@/app/(dashboard)/users/actions"
import { Switch } from "@/components/ui/switch"

export function ToggleUserActiveSwitch({
  userId,
  isActive,
  disabled,
}: {
  userId: string
  isActive: boolean
  disabled?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await toggleUserActive(userId, checked)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleChange}
      disabled={disabled || isPending}
      title={disabled ? "Vous ne pouvez pas désactiver votre propre compte" : undefined}
    />
  )
}

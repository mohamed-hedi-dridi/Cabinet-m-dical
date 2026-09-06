"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu } from "lucide-react"

import { logout } from "@/app/login/actions"
import { NAV_ITEMS } from "@/components/layout/nav-items"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  DOCTOR: "Médecin",
  SECRETARY: "Secrétaire",
}

export function Header({
  fullName,
  role,
}: {
  fullName: string
  role: UserRole
}) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="h-14 justify-center border-b">
            <SheetTitle>Cabinet Médical</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" +
                    (isActive ? " bg-muted text-foreground" : "")
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">{fullName}</p>
          <Badge variant="secondary" className="mt-1">
            {ROLE_LABELS[role]}
          </Badge>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon" title="Déconnexion">
            <LogOut />
            <span className="sr-only">Déconnexion</span>
          </Button>
        </form>
      </div>
    </header>
  )
}

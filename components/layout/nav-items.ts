import type { LucideIcon } from "lucide-react"
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Stethoscope,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react"

import type { UserRole } from "@/types"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DOCTOR", "SECRETARY"],
  },
  {
    label: "Patients",
    href: "/patients",
    icon: Users,
    roles: ["ADMIN", "DOCTOR", "SECRETARY"],
  },
  {
    label: "Rendez-vous",
    href: "/appointments",
    icon: CalendarDays,
    roles: ["ADMIN", "DOCTOR", "SECRETARY"],
  },
  {
    label: "Consultations",
    href: "/consultations",
    icon: Stethoscope,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    label: "Maladies",
    href: "/diseases",
    icon: ClipboardList,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    label: "Bilans médicaux",
    href: "/medical-reports",
    icon: FileText,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    label: "Médecins",
    href: "/doctors",
    icon: UsersRound,
    roles: ["ADMIN"],
  },
  {
    label: "Utilisateurs",
    href: "/users",
    icon: UserCog,
    roles: ["ADMIN"],
  },
]

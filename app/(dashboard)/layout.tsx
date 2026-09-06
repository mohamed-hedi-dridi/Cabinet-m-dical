import { redirect } from "next/navigation"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/services/auth.service"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !user.profile || !user.profile.is_active) {
    redirect("/login")
  }

  return (
    <div className="flex h-svh">
      <Sidebar role={user.profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header fullName={user.profile.full_name} role={user.profile.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

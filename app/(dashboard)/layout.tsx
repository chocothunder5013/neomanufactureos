import { Sidebar } from "@/components/layout/sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) redirect("/auth")

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        {/* Pass the role to the sidebar */}
        <Sidebar userRole={session.user.role} />
      </div>
      <main className="md:pl-72">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
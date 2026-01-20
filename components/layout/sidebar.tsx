"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth-actions"
import { 
  Package, 
  ClipboardList, 
  Factory, 
  Settings, 
  Users,
  BarChart3,
  LogOut 
} from "lucide-react"

// Dashboard route removed from this array
const routes = [
  {
    label: "Work Orders",
    icon: ClipboardList,
    href: "/work-orders",
    color: "text-violet-500",
  },
  {
    label: "Inventory & BOM",
    icon: Package,
    href: "/inventory",
    color: "text-pink-700",
  },
  {
    label: "Work Centers",
    icon: Factory,
    href: "/work-centers",
    color: "text-orange-700",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-emerald-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-blue-700",
    isAdmin: true, 
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1 flex flex-col">
        {/* Logo link updated to /work-orders */}
        <Link href="/work-orders" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
             <Factory className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">
            ManufactureOS
          </h1>
        </Link>
        
        {/* Navigation Links */}
        <div className="space-y-1 flex-1">
          {routes.map((route) => {
            // Hide admin-only routes for non-admins
            if (route.isAdmin && userRole !== "ADMIN") return null;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Sign Out Button (Pinned to Bottom) */}
        <div className="mt-auto pt-4 border-t border-slate-800">
            <button 
              onClick={() => logout()}
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3 text-red-500" />
                Sign Out
              </div>
            </button>
        </div>
      </div>
    </div>
  )
}
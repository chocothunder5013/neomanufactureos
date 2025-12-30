// neo/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth")
  const isRoot = req.nextUrl.pathname === "/"

  if (isRoot) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  if (isOnDashboard) {
    if (isLoggedIn) return 
    return NextResponse.redirect(new URL("/auth", req.nextUrl))
  }

  if (isOnAuth) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return 
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

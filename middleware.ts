import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  
  // Update this line: Check for any protected route, not just dashboard
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith("/work-orders") ||
    req.nextUrl.pathname.startsWith("/inventory") ||
    req.nextUrl.pathname.startsWith("/work-centers") ||
    req.nextUrl.pathname.startsWith("/analytics") ||
    req.nextUrl.pathname.startsWith("/users") ||
    req.nextUrl.pathname.startsWith("/settings");

  const isOnAuth = req.nextUrl.pathname.startsWith("/auth")

  if (isProtectedRoute) {
    if (isLoggedIn) return 
    return NextResponse.redirect(new URL("/auth", req.nextUrl))
  }

  if (isOnAuth) {
    if (isLoggedIn) {
      // FIX: Redirect to work-orders instead of dashboard
      return NextResponse.redirect(new URL("/work-orders", req.nextUrl))
    }
    return 
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
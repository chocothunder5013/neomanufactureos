import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Factory, ShieldCheck, Zap, ArrowRight, ClipboardList } from "lucide-react";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // The destination for logged-in users is now Work Orders
  const appDestination = "/work-orders";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      
      {/* Navigation Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <Factory className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight">ManufactureOS</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {isLoggedIn ? (
             <Link href={appDestination}>
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="h-4 w-4" /> Enter App
                </Button>
             </Link>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  The OS for Modern Factories
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Control your production floor in real-time. Track inventory, manage work orders, and analyze efficiency—all in one place.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link href={isLoggedIn ? appDestination : "/auth"}>
                  <Button size="lg" className="h-12 px-8 text-base">
                    {isLoggedIn ? "Go to Work Orders" : "Get Started Now"} 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-zinc-900/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 transition-all hover:shadow-md">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                   <Zap className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                </div>
                <h2 className="text-xl font-bold">Real-Time Sync</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Instant updates across the floor using Socket.io. When a Work Order updates, everyone sees it instantly.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 transition-all hover:shadow-md">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="text-xl font-bold">Role-Based Access</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Secure environment with distinct permissions. Admins manage users, Operators focus on tasks.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 transition-all hover:shadow-md">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Factory className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                </div>
                <h2 className="text-xl font-bold">Resource Planning</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Comprehensive BOM management, stock ledgers, and work center capacity planning.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-zinc-950">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 ManufactureOS. Built for the future.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
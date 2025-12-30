import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory } from "lucide-react"

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-1 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Factory className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">ManufactureOS</CardTitle>
          <CardDescription>
            Enter your credentials to access the production floor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server"
              await signIn("credentials", formData)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@demo.com" 
                required 
                defaultValue="admin@demo.com" // Pre-filled for easier testing
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                defaultValue="Admin@123" 
              />
            </div>
            
            {/* Display error message if login failed */}
            {searchParams?.error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded text-sm text-center">
                Invalid credentials. Please try again.
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

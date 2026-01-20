import { auth } from "@/auth";
import { updateProfile } from "@/actions/settings";
import { ThemeSwitcher } from "@/components/theme-switcher"; // <--- This was missing
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-lg">
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">{session.user.name}</h3>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              <Badge variant="secondary" className="mt-2">{session.user.role}</Badge>
            </div>
          </div>

          <Separator />

          <form action={updateProfile} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={session.user.name || ""} 
                placeholder="Your full name" 
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the interface.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
           <div className="space-y-1">
             <div className="font-medium">Theme Preferences</div>
             <p className="text-sm text-muted-foreground">
               Choose between light/dark mode and select your preferred accent color.
             </p>
           </div>
           <ThemeSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}
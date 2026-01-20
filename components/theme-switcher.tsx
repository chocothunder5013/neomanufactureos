"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const colors = [
  { name: "Zinc", class: "" }, // Default
  { name: "Blue", class: "theme-blue" },
  { name: "Rose", class: "theme-rose" },
  { name: "Green", class: "theme-green" },
]

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const [color, setColor] = React.useState("")

  // Load saved color from local storage on mount
  React.useEffect(() => {
    const savedColor = localStorage.getItem("manufacture-theme-color") || ""
    setColor(savedColor)
    document.body.className = cn(
      document.body.className.replace(/theme-\w+/g, ""), 
      savedColor
    )
  }, [])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    localStorage.setItem("manufacture-theme-color", newColor)
    
    // Remove old theme classes and add new one
    document.body.classList.remove("theme-blue", "theme-rose", "theme-green")
    if (newColor) document.body.classList.add(newColor)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
        
        <div className="grid grid-cols-4 gap-1 p-1">
            {colors.map((c) => (
                <button
                    key={c.name}
                    className={cn(
                        "h-6 w-6 rounded-full border flex items-center justify-center transition-all hover:scale-110",
                        c.name === "Zinc" && "bg-zinc-900 border-zinc-900",
                        c.name === "Blue" && "bg-blue-600 border-blue-600",
                        c.name === "Rose" && "bg-rose-600 border-rose-600",
                        c.name === "Green" && "bg-emerald-600 border-emerald-600",
                    )}
                    onClick={() => handleColorChange(c.class)}
                    title={c.name}
                >
                   {color === c.class && <Check className="h-3 w-3 text-white" />}
                </button>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
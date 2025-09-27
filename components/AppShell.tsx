'use client'

import * as React from "react"
import { TrendingUp, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [activeTab, setActiveTab] = React.useState("dashboard")

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "models", label: "Models", icon: TrendingUp },
    { id: "scenarios", label: "Scenarios", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <TrendingUp className="h-4 w-4 text-primary-fg" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">LRP Prototype</h1>
                <p className="text-xs text-muted-foreground">Financial Planning Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3",
                    activeTab === tab.id && "bg-accent text-accent-fg"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>

            {/* Command Palette */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Command palette"
            >
              <Command className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}

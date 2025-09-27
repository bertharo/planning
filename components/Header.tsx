'use client'

import { BarChart3, GitBranch, LayoutDashboard, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  activeTab: 'dashboard' | 'models' | 'scenarios'
  setActiveTab: (tab: 'dashboard' | 'models' | 'scenarios') => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'models' as const, label: 'Models', icon: BarChart3 },
    { id: 'scenarios' as const, label: 'Scenarios', icon: GitBranch },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-4 w-4 text-accent-fg" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-fg">LRP Prototype</h1>
              <p className="text-xs text-fgMuted">Financial Planning Platform</p>
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
                  activeTab === tab.id && "bg-muted text-fg"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            )
          })}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <nav className="flex items-center space-x-1 bg-muted p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-1 px-2",
                    activeTab === tab.id && "bg-card text-fg"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{tab.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

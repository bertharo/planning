'use client'

import { BarChart3, GitBranch, LayoutDashboard } from 'lucide-react'

interface HeaderProps {
  activeTab: 'dashboard' | 'models' | 'scenarios'
  setActiveTab: (tab: 'dashboard' | 'models' | 'scenarios') => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card px-3 lg:px-6 py-3 lg:py-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-3 lg:space-y-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-8">
          <h1 className="text-lg lg:text-2xl font-bold text-foreground">SaaS Planning Platform</h1>

          <nav className="flex flex-wrap gap-2 lg:gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-md transition-colors text-sm lg:text-base ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-md transition-colors text-sm lg:text-base ${
                activeTab === 'models'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Models</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-md transition-colors text-sm lg:text-base ${
                activeTab === 'scenarios'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

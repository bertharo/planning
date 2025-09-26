'use client'

import { BarChart3, GitBranch, LayoutDashboard } from 'lucide-react'

interface HeaderProps {
  activeTab: 'dashboard' | 'models' | 'scenarios'
  setActiveTab: (tab: 'dashboard' | 'models' | 'scenarios') => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-foreground">SaaS Planning Platform</h1>
          
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'models'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Models</span>
            </button>
            
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Scenarios</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

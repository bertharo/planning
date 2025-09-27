'use client'

import { BarChart3, GitBranch, LayoutDashboard, TrendingUp } from 'lucide-react'

interface HeaderProps {
  activeTab: 'dashboard' | 'models' | 'scenarios'
  setActiveTab: (tab: 'dashboard' | 'models' | 'scenarios') => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <div className="border-b border-border/50 bg-gradient-to-r from-slate-50 to-white px-4 lg:px-8 py-4 lg:py-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                LRP Prototype
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Financial Planning Platform</p>
            </div>
          </div>

          <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === 'models'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Models</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === 'scenarios'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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

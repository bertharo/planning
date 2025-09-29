'use client'

import { useState } from 'react'
import { EnhancedDataSourcePanel } from '@/components/EnhancedDataSourcePanel'
import { EnhancedNaturalLanguageInterface } from '@/components/EnhancedNaturalLanguageInterface'
import { ModelsSection } from '@/components/ModelsSection'
import { EnhancedScenariosSection } from '@/components/EnhancedScenariosSection'
import { DashboardSection } from '@/components/DashboardSection'
import { Header } from '@/components/Header'
import { MotionCard } from '@/components/ui/motion'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'models' | 'scenarios'>('dashboard')
  const [dataSources, setDataSources] = useState([
    { id: 'workday', name: 'Workday', type: 'HR', connected: false },
    { id: 'salesforce', name: 'Salesforce', type: 'CRM', connected: false },
    { id: 'databricks', name: 'Databricks', type: 'Data', connected: false },
    { id: 'snowflake', name: 'Snowflake', type: 'Data', connected: false },
    { id: 'google-sheets', name: 'Google Sheets', type: 'Spreadsheet', connected: false },
    { id: 'excel', name: 'Excel', type: 'Spreadsheet', connected: false },
  ])

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mx-auto max-w-screen-2xl px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Data Sources Panel */}
          <div className="lg:col-span-3">
            <MotionCard className="border-r-0 lg:border-r-2 border-gray-300">
              <EnhancedDataSourcePanel />
            </MotionCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6">
            <MotionCard className="border-r-0 lg:border-r-2 border-gray-300">
              {activeTab === 'dashboard' && <DashboardSection />}
              {activeTab === 'models' && <ModelsSection />}
              {activeTab === 'scenarios' && <EnhancedScenariosSection />}
            </MotionCard>
          </div>

          {/* Natural Language Interface */}
          <div className="lg:col-span-3">
            <MotionCard>
              <EnhancedNaturalLanguageInterface />
            </MotionCard>
          </div>
        </div>
      </main>
    </div>
  )
}

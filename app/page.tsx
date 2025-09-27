'use client'

import { useState } from 'react'
import { DataSourcePanel } from '@/components/DataSourcePanel'
import { NaturalLanguageInterface } from '@/components/NaturalLanguageInterface'
import { ModelsSection } from '@/components/ModelsSection'
import { ScenariosSection } from '@/components/ScenariosSection'
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
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Data Sources Panel */}
          <MotionCard className="lg:col-span-3">
            <DataSourcePanel
              dataSources={dataSources}
              setDataSources={setDataSources}
            />
          </MotionCard>

          {/* Main Content Area */}
          <div className="lg:col-span-6">
            <MotionCard>
              {activeTab === 'dashboard' && <DashboardSection />}
              {activeTab === 'models' && <ModelsSection />}
              {activeTab === 'scenarios' && <ScenariosSection />}
            </MotionCard>
          </div>

          {/* Natural Language Interface */}
          <MotionCard className="lg:col-span-3">
            <NaturalLanguageInterface />
          </MotionCard>
        </div>
      </div>
    </div>
  )
}

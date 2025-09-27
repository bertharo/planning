'use client'

import { useState } from 'react'
import { DataSourcePanel } from '@/components/DataSourcePanel'
import { NaturalLanguageInterface } from '@/components/NaturalLanguageInterface'
import { ModelsSection } from '@/components/ModelsSection'
import { ScenariosSection } from '@/components/ScenariosSection'
import { DashboardSection } from '@/components/DashboardSection'
import { Header } from '@/components/Header'

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
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile: Collapsible Data Sources Panel */}
      <div className="lg:w-80 w-full border-b lg:border-b-0 lg:border-r border-slate-200 bg-white lg:block shadow-sm">
        <DataSourcePanel
          dataSources={dataSources}
          setDataSources={setDataSources}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Mobile: Collapsible Natural Language Interface */}
          <div className="lg:w-96 w-full border-b lg:border-b-0 lg:border-r border-slate-200 bg-white lg:block shadow-sm">
            <NaturalLanguageInterface />
          </div>

          {/* Content Area - Full width on mobile, flexible on desktop */}
          <div className="flex-1 p-4 lg:p-8 min-h-0 overflow-auto bg-gradient-to-br from-slate-50/50 to-white">
            <div className="animate-fade-in">
              {activeTab === 'dashboard' && <DashboardSection />}
              {activeTab === 'models' && <ModelsSection />}
              {activeTab === 'scenarios' && <ScenariosSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

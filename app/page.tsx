'use client'

import { useState } from 'react'
import { DataSourcePanel } from '@/components/DataSourcePanel'
import { NaturalLanguageInterface } from '@/components/NaturalLanguageInterface'
import { ModelsSection } from '@/components/ModelsSection'
import { ScenariosSection } from '@/components/ScenariosSection'
import { Header } from '@/components/Header'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'models' | 'scenarios'>('models')
  const [dataSources, setDataSources] = useState([
    { id: 'workday', name: 'Workday', type: 'HR', connected: false },
    { id: 'salesforce', name: 'Salesforce', type: 'CRM', connected: false },
    { id: 'databricks', name: 'Databricks', type: 'Data', connected: false },
    { id: 'snowflake', name: 'Snowflake', type: 'Data', connected: false },
    { id: 'google-sheets', name: 'Google Sheets', type: 'Spreadsheet', connected: false },
    { id: 'excel', name: 'Excel', type: 'Spreadsheet', connected: false },
  ])

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Data Sources */}
      <div className="w-80 border-r border-border bg-card">
        <DataSourcePanel 
          dataSources={dataSources}
          setDataSources={setDataSources}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex">
          {/* Natural Language Interface */}
          <div className="w-96 border-r border-border bg-card">
            <NaturalLanguageInterface />
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'models' && <ModelsSection />}
            {activeTab === 'scenarios' && <ScenariosSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

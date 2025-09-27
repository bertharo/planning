# LRP Prototype

A modern financial planning platform with a natural language interface for creating and managing financial models and scenarios.

## Features

### 🎯 Natural Language Interface
- Chat with an AI assistant to create models, analyze data, and build scenarios
- Intuitive conversation flow for financial planning tasks
- Context-aware responses based on your connected data sources

### 📊 Data Source Integration
- Connect to popular data sources:
  - **Workday** - HR and workforce data
  - **Salesforce** - CRM and sales data
  - **Databricks** - Analytics and data processing
  - **Snowflake** - Data warehouse and analytics
  - **Google Sheets** - Spreadsheet data with real-time sync
  - **Excel** - Local and cloud Excel file integration
- Easy configuration and connection management
- Real-time data synchronization
- Spreadsheet-specific features (auto-refresh, range selection)

### 📈 Financial Models
- **Revenue Models** - SaaS revenue forecasting with MRR projections
- **CapEx Models** - Capital expenditure planning and budgeting
- **Personnel Models** - Headcount planning and compensation modeling
- Save, edit, and export models
- Version control and collaboration features

### 🔄 Scenario Planning
- Create multiple business scenarios (optimistic, conservative, aggressive)
- Compare different assumptions and outcomes
- Base scenarios on existing models
- Track scenario status and modifications

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks and local state
- **AI Integration**: OpenAI API (ready for implementation)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── DataSourcePanel.tsx    # Left panel for data sources
│   ├── Header.tsx             # Top navigation
│   ├── ModelsSection.tsx      # Models management
│   ├── NaturalLanguageInterface.tsx # AI chat interface
│   └── ScenariosSection.tsx   # Scenarios management
├── package.json           # Dependencies and scripts
└── tailwind.config.js     # Tailwind configuration
```

## Key Components

### DataSourcePanel
- Manages connections to external data sources
- Configuration UI for each data source
- Connection status indicators

### NaturalLanguageInterface
- Chat interface for AI interactions
- Message history and context
- Loading states and error handling

### ModelsSection
- Grid layout for financial models
- Create, edit, delete, and export functionality
- Model type categorization

### ScenariosSection
- Scenario management and comparison
- Assumption tracking
- Status management (draft, active, archived)

## Next Steps

- [ ] Implement OpenAI API integration
- [ ] Add data source API connections
- [ ] Build model calculation engine
- [ ] Add user authentication
- [ ] Implement data persistence
- [ ] Add collaborative features
- [ ] Create advanced visualization components

## Contributing

This is a prototype SaaS planning platform. Feel free to extend and customize based on your specific needs.

## License

MIT License - feel free to use this project for your own SaaS planning needs.

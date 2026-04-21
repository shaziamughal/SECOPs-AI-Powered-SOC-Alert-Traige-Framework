import React from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import AlertTrendChart from '../components/dashboard/AlertTrendChart';
import MLAccuracyChart from '../components/dashboard/MLAccuracyChart';
import LLMInsightPanel from '../components/dashboard/LLMInsightPanel';
import AlertsTable from '../components/dashboard/AlertsTable';
import { Layers, Flame, CheckCircle, Wand2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Alerts (24h)" 
          value="1,492" 
          subtext="↓ 12% vs yesterday" 
          colorClass="text-cyan-400"
          trend="12%"
          icon={<Layers className="w-6 h-6" />}
        />
        <StatsCard 
          title="High Priority" 
          value="47" 
          subtext="Requires immediate triage" 
          colorClass="text-red-400"
          icon={<Flame className="w-6 h-6" />}
        />
        <StatsCard 
          title="False Positives (ML)" 
          value="892" 
          subtext="Auto-closed by Confidence > 90%" 
          colorClass="text-emerald-400"
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatsCard 
          title="Enriched by LLM" 
          value="124" 
          subtext="Context & IOCs extracted" 
          colorClass="text-violet-400"
          icon={<Wand2 className="w-6 h-6" />}
        />
      </div>

      {/* Row 2: Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
        <div className="lg:col-span-2 h-full">
          <AlertTrendChart />
        </div>
        <div className="h-full">
          <MLAccuracyChart />
        </div>
      </div>

      {/* Row 3: Insights & Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div className="h-full">
          <LLMInsightPanel />
        </div>
        <div className="lg:col-span-2 h-full">
          <AlertsTable />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
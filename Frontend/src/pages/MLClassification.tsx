
import React from 'react';
import { Brain, Activity, Target, GitMerge, BarChart3, HelpCircle, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const MLClassification: React.FC = () => {
  // Mock Data for Charts
  const performanceData = [
    { time: '00:00', accuracy: 92, precision: 88 },
    { time: '04:00', accuracy: 94, precision: 90 },
    { time: '08:00', accuracy: 91, precision: 85 },
    { time: '12:00', accuracy: 96, precision: 94 },
    { time: '16:00', accuracy: 97, precision: 95 },
    { time: '20:00', accuracy: 95, precision: 92 },
  ];

  const featureImportance = [
    { name: 'IP Reputation', value: 85 },
    { name: 'Payload Entropy', value: 72 },
    { name: 'Time Variance', value: 64 },
    { name: 'User Behavior', value: 58 },
    { name: 'Port Access', value: 45 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <Brain className="mr-3 text-emerald-500" />
          ML Classification Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor model performance, feature importance, and classification accuracy in real-time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Model Accuracy" 
          value="96.4%" 
          subtext="Last 24 hours" 
          colorClass="text-emerald-400"
          icon={<Target className="w-5 h-5" />}
          trend="+0.8%"
        />
        <StatsCard 
          title="Noise Reduction" 
          value="-65%" 
          subtext="Alerts auto-suppressed" 
          colorClass="text-cyan-400"
          icon={<GitMerge className="w-5 h-5" />}
        />
        <StatsCard 
          title="False Positives" 
          value="3.2%" 
          subtext="Below threshold (5%)" 
          colorClass="text-amber-400"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
         <StatsCard 
          title="Model Version" 
          value="v2.4.1" 
          subtext="Updated: 2h ago" 
          colorClass="text-violet-400"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Accuracy Over Time */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
           <h3 className="text-slate-200 font-semibold text-sm mb-6 flex items-center">
             <Activity className="w-4 h-4 mr-2 text-slate-500" />
             Model Performance Trend (24h)
           </h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={performanceData}>
                 <defs>
                   <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[80, 100]} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                   itemStyle={{ fontSize: '12px' }}
                 />
                 <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                 <Area type="monotone" dataKey="precision" stroke="#6366f1" strokeWidth={2} fillOpacity={0} fill="none" strokeDasharray="4 4" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-slate-200 font-semibold text-sm mb-6 flex items-center">
             <BarChart3 className="w-4 h-4 mr-2 text-slate-500" />
             Top Predictive Features
           </h3>
           <div className="space-y-4">
             {featureImportance.map((feature, idx) => (
               <div key={idx} className="group">
                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>{feature.name}</span>
                   <span className="text-slate-200">{feature.value}</span>
                 </div>
                 <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                   <div 
                      className="h-full bg-cyan-500/80 rounded-full group-hover:bg-cyan-400 transition-colors" 
                      style={{ width: `${feature.value}%` }}
                    ></div>
                 </div>
               </div>
             ))}
           </div>
           <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-cyan-400 font-medium">Insight:</span> "IP Reputation" is currently the dominant factor for identifying Brute Force attacks in the current dataset.
              </p>
           </div>
        </div>
      </div>

      {/* Confusion Matrix & Recent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Confusion Matrix */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
           <h3 className="text-slate-200 font-semibold text-sm mb-4">Confusion Matrix (Live)</h3>
           <div className="grid grid-cols-2 gap-2 h-64">
              {/* True Positive */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex flex-col justify-center items-center relative overflow-hidden">
                 <span className="text-3xl font-bold text-emerald-400">852</span>
                 <span className="text-xs text-emerald-500/70 uppercase font-semibold mt-1">True Positive</span>
                 <ShieldCheck className="absolute top-2 right-2 text-emerald-500/20 w-8 h-8" />
              </div>
              
              {/* False Positive */}
              <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 flex flex-col justify-center items-center relative">
                 <span className="text-3xl font-bold text-slate-300">42</span>
                 <span className="text-xs text-slate-500 uppercase font-semibold mt-1">False Positive</span>
                 <AlertTriangle className="absolute top-2 right-2 text-slate-500/20 w-8 h-8" />
              </div>

               {/* False Negative */}
               <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col justify-center items-center relative">
                 <span className="text-3xl font-bold text-red-400">3</span>
                 <span className="text-xs text-red-500/70 uppercase font-semibold mt-1">False Negative</span>
                 <AlertTriangle className="absolute top-2 right-2 text-red-500/20 w-8 h-8" />
              </div>

              {/* True Negative */}
              <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 flex flex-col justify-center items-center relative">
                 <span className="text-3xl font-bold text-slate-300">12k</span>
                 <span className="text-xs text-slate-500 uppercase font-semibold mt-1">True Negative</span>
                 <CheckCircle2 className="absolute top-2 right-2 text-slate-500/20 w-8 h-8" />
              </div>
           </div>
        </div>

        {/* Live Decisions Log */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
               <h3 className="text-slate-200 font-semibold text-sm">Recent Classification Stream</h3>
               <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded animate-pulse">Live</span>
            </div>
            <div className="overflow-y-auto max-h-[250px] p-0">
               {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors flex items-center justify-between group">
                     <div>
                        <div className="flex items-center space-x-2">
                           <span className="text-xs font-mono text-slate-500">#Ev-{84930+i}</span>
                           <span className="text-sm text-slate-200">Suspicious PowerShell execution</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                           <span>Confidence: <span className="text-emerald-400 font-semibold">{92 + i}%</span></span>
                           <span>•</span>
                           <span>Feature: Payload Length</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-400 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                           Malicious
                        </span>
                     </div>
                  </div>
               ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MLClassification;

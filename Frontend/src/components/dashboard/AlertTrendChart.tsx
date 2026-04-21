import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TREND_DATA } from '../../constants';

const AlertTrendChart: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-semibold text-sm">Alert Ingestion Trend (Real-time)</h3>
        <div className="flex items-center space-x-3 text-xs">
           <div className="flex items-center space-x-1">
               <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
               <span className="text-slate-400">Total Events</span>
           </div>
           <div className="flex items-center space-x-1">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-slate-400">High Severity</span>
           </div>
           <div className="bg-slate-700 rounded px-2 py-0.5 text-slate-300 ml-2">Last 24h</div>
        </div>
      </div>
      
      <div className="flex-grow w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                interval={2}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
            />
            <Area 
                type="monotone" 
                dataKey="totalEvents" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
            />
            <Area 
                type="monotone" 
                dataKey="highSeverity" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlertTrendChart;
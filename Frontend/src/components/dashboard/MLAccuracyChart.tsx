import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MLAccuracyChart: React.FC = () => {
  const data = [
    { name: 'Accuracy', value: 96.4 },
    { name: 'Error', value: 3.6 },
  ];
  const COLORS = ['#10b981', '#1e293b']; // Emerald-500 and Slate-800

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 h-full flex flex-col relative">
      <h3 className="text-slate-200 font-semibold text-sm mb-2">Classification Accuracy</h3>
      
      <div className="flex-grow relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              paddingAngle={5}
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white">96.4%</span>
          <span className="text-xs text-slate-400">Accuracy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
         <div className="bg-slate-900/50 rounded p-2 text-center">
             <div className="text-xs text-slate-500">Model Conf.</div>
             <div className="text-sm font-semibold text-cyan-400">0.92</div>
         </div>
         <div className="bg-slate-900/50 rounded p-2 text-center">
             <div className="text-xs text-slate-500">Noise Red.</div>
             <div className="text-sm font-semibold text-emerald-400">-65%</div>
         </div>
      </div>
    </div>
  );
};

export default MLAccuracyChart;
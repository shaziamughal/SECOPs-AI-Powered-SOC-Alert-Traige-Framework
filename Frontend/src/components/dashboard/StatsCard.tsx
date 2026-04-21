import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subtext: string;
  colorClass?: string;
  icon?: React.ReactNode;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, colorClass = "text-white", icon, trend }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden group hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
        {icon && <div className={`opacity-80 ${colorClass}`}>{icon}</div>}
      </div>
      
      <div className="flex flex-col">
        <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
        <div className="flex items-center mt-2 space-x-2">
            {trend && (
               <span className="text-xs font-medium text-emerald-400 flex items-center">
                   {trend}
               </span> 
            )}
           <span className="text-xs text-slate-500">{subtext}</span>
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl ${colorClass.replace('text-', 'bg-')}`}></div>
    </div>
  );
};

export default StatsCard;
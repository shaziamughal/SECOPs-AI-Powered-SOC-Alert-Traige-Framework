import React from 'react';
import { Search, MoreHorizontal, Shield, PlayCircle, AlertOctagon } from 'lucide-react';
import { MOCK_ALERTS } from '../../constants';
import Badge from '../common/Badge';

const AlertsTable: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-slate-200 font-semibold text-sm">Recent Alerts Stream</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-600 w-48 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 text-xs text-slate-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Alert ID</th>
              <th className="p-4 font-medium">Severity</th>
              <th className="p-4 font-medium">Rule / Description</th>
              <th className="p-4 font-medium">Source</th>
              <th className="p-4 font-medium">ML Class</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-700/30">
            {MOCK_ALERTS.map((alert) => (
              <tr key={alert.id} className="group hover:bg-slate-700/20 transition-colors">
                <td className="p-4 font-mono text-cyan-400 font-medium">{alert.id}</td>
                <td className="p-4">
                  <Badge 
                    label={alert.severity} 
                    type={alert.severity === 'High' ? 'error' : alert.severity === 'Medium' ? 'warning' : alert.severity === 'Low' ? 'neutral' : 'info'} 
                  />
                </td>
                <td className="p-4 text-slate-300">{alert.rule}</td>
                <td className="p-4 font-mono text-slate-400 text-xs">{alert.sourceIp}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {alert.mlClass === 'TP' && <Shield className="w-3 h-3 text-emerald-500" />}
                    {alert.mlClass === 'FP' && <AlertOctagon className="w-3 h-3 text-slate-500" />}
                    {alert.mlClass === 'Uncertain' && <span className="w-3 h-3 rounded-full border border-amber-500/50 flex items-center justify-center text-[8px] text-amber-500">?</span>}
                    
                    <span className={`${alert.mlClass === 'TP' ? 'text-emerald-400' : alert.mlClass === 'FP' ? 'text-slate-500' : 'text-amber-400'}`}>
                        {alert.mlClass} 
                        {alert.mlConfidence > 0 && <span className="text-xs opacity-70 ml-1">({alert.mlConfidence}%)</span>}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                    {alert.action === 'Auto-Closed' ? (
                        <span className="text-xs text-slate-500 italic">Auto-Closed</span>
                    ) : (
                         <button className="text-slate-500 hover:text-violet-400 transition-colors p-1 rounded hover:bg-slate-700">
                             <PlayCircle className="w-4 h-4" />
                         </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;


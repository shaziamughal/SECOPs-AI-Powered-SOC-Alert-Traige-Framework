import React, { useState } from 'react';
import { Filter, Search, Download, MoreHorizontal, ChevronDown, CheckSquare, Square, ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { MOCK_ALERTS } from '../constants';

const Alerts: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState('All');
  
  // Combine mock data to make a longer list for the full page
  const allAlerts = [...MOCK_ALERTS, ...MOCK_ALERTS, ...MOCK_ALERTS].map((alert, index) => ({
      ...alert,
      id: `${alert.id}-${index}` // Unique IDs
  }));

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <ShieldAlert className="mr-3 text-cyan-500" />
            Alert Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and triage security incidents detected across the infrastructure.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
             <Button variant="secondary" size="sm" className="flex items-center gap-2">
                 <Download size={14} /> Export CSV
             </Button>
             <Button variant="primary" size="sm">
                 Create Manual Incident
             </Button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
           <span className="text-xs text-slate-500 uppercase font-semibold">Open Alerts</span>
           <div className="text-2xl font-bold text-white mt-1">42</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
           <span className="text-xs text-slate-500 uppercase font-semibold">Critical</span>
           <div className="text-2xl font-bold text-red-400 mt-1">7</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
           <span className="text-xs text-slate-500 uppercase font-semibold">Assigned</span>
           <div className="text-2xl font-bold text-cyan-400 mt-1">15</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
           <span className="text-xs text-slate-500 uppercase font-semibold">Avg Triage Time</span>
           <div className="text-2xl font-bold text-emerald-400 mt-1">12m</div>
        </div>
      </div>

      {/* Controls & Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-t-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center flex-1 w-full sm:w-auto relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by IP, Rule ID, or User..." 
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-96 transition-colors"
            />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
           <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
               <Filter className="w-4 h-4 mr-2 text-slate-500" />
               <span className="mr-2">Severity:</span>
               <select 
                 className="bg-transparent border-none text-white focus:ring-0 cursor-pointer"
                 value={filterSeverity}
                 onChange={(e) => setFilterSeverity(e.target.value)}
               >
                 <option value="All">All</option>
                 <option value="High">High</option>
                 <option value="Medium">Medium</option>
                 <option value="Low">Low</option>
               </select>
           </div>
           
           <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
               <span className="mr-2">Status:</span>
               <select className="bg-transparent border-none text-white focus:ring-0 cursor-pointer">
                 <option>All Status</option>
                 <option>Open</option>
                 <option>Closed</option>
               </select>
           </div>
        </div>
      </div>

      {/* Full Alerts Table */}
      <div className="bg-slate-800/40 border-x border-b border-slate-700 rounded-b-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <th className="p-4 w-10 text-center"><Square className="w-4 h-4" /></th>
                <th className="p-4 font-medium">Alert ID</th>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Rule Name</th>
                <th className="p-4 font-medium">Source IP</th>
                <th className="p-4 font-medium">ML Confidence</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/50">
                {allAlerts.map((alert, idx) => (
                <tr key={idx} className="group hover:bg-slate-700/30 transition-colors cursor-pointer">
                    <td className="p-4 text-center text-slate-600"><Square className="w-4 h-4" /></td>
                    <td className="p-4 font-mono text-cyan-400 font-medium">#{alert.id.split('-')[0]}</td>
                    <td className="p-4 text-slate-400">{alert.timestamp}</td>
                    <td className="p-4">
                        <Badge 
                            label={alert.severity} 
                            type={alert.severity === 'High' ? 'error' : alert.severity === 'Medium' ? 'warning' : alert.severity === 'Low' ? 'neutral' : 'info'} 
                        />
                    </td>
                    <td className="p-4 text-slate-200 font-medium">{alert.rule}</td>
                    <td className="p-4 font-mono text-slate-400">{alert.sourceIp}</td>
                    <td className="p-4">
                        <div className="flex items-center space-x-2">
                             <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${alert.mlConfidence > 90 ? 'bg-emerald-500' : alert.mlConfidence > 70 ? 'bg-cyan-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${alert.mlConfidence}%` }}
                                 ></div>
                             </div>
                             <span className="text-xs text-slate-400">{alert.mlConfidence}%</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${alert.action === 'Auto-Closed' ? 'bg-slate-700 text-slate-400' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                            {alert.action === 'Auto-Closed' ? 'Closed' : 'Open'}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <button className="text-slate-400 hover:text-white p-1">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-700 flex justify-between items-center text-sm text-slate-400">
             <div>Showing 1-15 of 42 results</div>
             <div className="flex gap-2">
                 <Button variant="secondary" size="sm" className="bg-slate-800 border-slate-700 disabled:opacity-50" disabled>Previous</Button>
                 <Button variant="secondary" size="sm" className="bg-slate-800 border-slate-700">Next</Button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
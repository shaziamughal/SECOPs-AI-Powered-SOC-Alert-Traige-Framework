
import React, { useState } from 'react';
import { Search, Share2, MessageSquare, Clock, ShieldAlert, Monitor, User, Globe, ArrowRight, Zap, FileText } from 'lucide-react';
import Button from '../components/common/Button';

const Investigation: React.FC = () => {
  const [query, setQuery] = useState('');

  // Mock Timeline Data
  const timelineEvents = [
    { time: '14:20:01', event: 'Initial Access', detail: 'SSH Login Successful (root)', type: 'critical' },
    { time: '14:21:15', event: 'Execution', detail: 'PowerShell Script Run (Encoded)', type: 'warning' },
    { time: '14:22:30', event: 'Discovery', detail: 'Network Scanning (Port 445)', type: 'info' },
    { time: '14:25:00', event: 'C2 Beacon', detail: 'Outbound Traffic to 45.33.22.11', type: 'critical' },
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Investigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Search className="mr-3 text-violet-500" />
            Investigation Workspace
          </h1>
           <div className="flex items-center space-x-3 mt-1 text-sm">
              <span className="text-slate-400">Case ID: <span className="text-slate-200 font-mono">#INV-2023-8821</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> High Severity</span>
           </div>
        </div>
        <div className="flex gap-3">
             <Button variant="secondary" size="sm">
                 <Share2 size={16} className="mr-2" /> Collaborate
             </Button>
             <Button variant="primary" size="sm">
                 Close Case
             </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Left Column: Context & Timeline (3 cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
             
             {/* Search */}
             <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                 <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Add Entity to Graph</h3>
                 <div className="relative">
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                     <input 
                        type="text" 
                        placeholder="IP, User, Host..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                     />
                 </div>
             </div>

             {/* Timeline */}
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl flex-1 flex flex-col min-h-0">
                 <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-slate-200">Event Timeline</h3>
                     <Clock className="w-4 h-4 text-slate-500" />
                 </div>
                 <div className="p-4 overflow-y-auto space-y-6 custom-scrollbar">
                     {timelineEvents.map((event, idx) => (
                         <div key={idx} className="relative pl-6 border-l-2 border-slate-700 last:border-0 pb-2">
                             <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                                 event.type === 'critical' ? 'bg-red-500' : event.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'
                             }`}></div>
                             <div className="text-xs text-slate-500 font-mono mb-0.5">{event.time}</div>
                             <div className="text-sm font-medium text-slate-200">{event.event}</div>
                             <div className="text-xs text-slate-400 mt-1">{event.detail}</div>
                         </div>
                     ))}
                     <div className="pt-4 text-center">
                         <button className="text-xs text-cyan-400 hover:underline">Load older events</button>
                     </div>
                 </div>
             </div>

        </div>

        {/* Center Column: Visual Graph (6 cols) */}
        <div className="col-span-12 lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex space-x-2">
                <div className="bg-slate-800/80 backdrop-blur rounded-lg p-1 border border-slate-700 flex">
                     <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Monitor size={16}/></button>
                     <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Globe size={16}/></button>
                     <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><User size={16}/></button>
                </div>
            </div>

            {/* Canvas/Graph Area (Simulated with CSS) */}
            <div className="flex-1 w-full h-full relative" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Line 1: Attacker -> Firewall */}
                    <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
                    {/* Line 2: Firewall -> Server */}
                    <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#ef4444" strokeWidth="2" />
                     {/* Line 3: Server -> DB */}
                     <line x1="80%" y1="30%" x2="80%" y2="70%" stroke="#475569" strokeWidth="2" />
                </svg>

                {/* Nodes */}
                
                {/* Node 1: Attacker */}
                <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:border-red-500 group-hover:shadow-red-500/20 transition-all z-10">
                        <Globe className="w-8 h-8 text-slate-400 group-hover:text-red-400" />
                    </div>
                    <div className="mt-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">192.168.45.12</div>
                </div>

                {/* Node 2: Alert/Firewall */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                     <div className="w-12 h-12 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                        <Zap className="w-6 h-6 text-red-400" />
                    </div>
                     <div className="mt-2 bg-red-900/80 px-2 py-1 rounded text-xs text-red-200 border border-red-700 font-bold">Alert #8821</div>
                </div>

                {/* Node 3: Target Server */}
                <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:border-cyan-500 transition-all">
                        <Monitor className="w-8 h-8 text-slate-400 group-hover:text-cyan-400" />
                    </div>
                     <div className="mt-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">Web-Server-01</div>
                </div>

                 {/* Node 4: Database */}
                 <div className="absolute top-[70%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:border-amber-500 transition-all">
                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-amber-400" />
                    </div>
                     <div className="mt-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">Customer_DB</div>
                </div>

            </div>
            
            {/* Graph Footer */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 text-[10px] text-slate-400 border border-slate-700">
                Visualizing 4 entities • Zoom: 100%
            </div>
        </div>

        {/* Right Column: AI Assistant (3 cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800">
                 <h3 className="text-sm font-semibold text-violet-200 flex items-center">
                     <MessageSquare className="w-4 h-4 mr-2 text-violet-400" /> Case Assistant
                 </h3>
             </div>
             
             {/* Chat History */}
             <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                 {/* AI Message */}
                 <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                         <Zap className="w-4 h-4 text-violet-400" />
                     </div>
                     <div className="bg-slate-700/50 rounded-r-lg rounded-bl-lg p-3 text-xs text-slate-300 leading-relaxed border border-slate-700">
                         I've correlated the alert #8821 with a known threat actor group. The IP <span className="text-cyan-400">192.168.45.12</span> has been seen in 3 other incidents involving 'Hydra'.
                     </div>
                 </div>

                 {/* User Message */}
                 <div className="flex gap-3 flex-row-reverse">
                     <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                         <User className="w-4 h-4 text-cyan-400" />
                     </div>
                     <div className="bg-cyan-900/20 rounded-l-lg rounded-br-lg p-3 text-xs text-cyan-100 leading-relaxed border border-cyan-800/50">
                         What is the recommended remediation?
                     </div>
                 </div>

                  {/* AI Message */}
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                         <Zap className="w-4 h-4 text-violet-400" />
                     </div>
                     <div className="bg-slate-700/50 rounded-r-lg rounded-bl-lg p-3 text-xs text-slate-300 leading-relaxed border border-slate-700">
                         Based on the attack pattern:
                         <ol className="list-decimal ml-4 mt-1 space-y-1 text-slate-400">
                             <li>Block IP range 192.168.45.0/24</li>
                             <li>Reset credentials for user 'root'</li>
                             <li>Patch OpenSSH to latest version</li>
                         </ol>
                     </div>
                 </div>
             </div>

             {/* Input Area */}
             <div className="p-3 bg-slate-900 border-t border-slate-800">
                 <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Ask SecOps AI..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                     />
                     <button className="absolute right-2 top-1.5 text-violet-400 hover:text-white">
                         <ArrowRight className="w-4 h-4" />
                     </button>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Investigation;

import React from 'react';
import { Brain, ShieldAlert, Terminal, Globe, User, Zap } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const LLMInsightPanel: React.FC = () => {
  return (
    <div className="bg-slate-800/80 border border-violet-500/30 rounded-xl p-0 h-full flex flex-col overflow-hidden relative shadow-lg shadow-violet-900/10">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="text-violet-100 font-semibold text-sm">LLM Alert Insight</h3>
        </div>
        <Badge label="Alert ID: #8821" className="bg-slate-900 text-slate-400 border border-slate-700" />
      </div>

      {/* Content */}
      <div className="p-5 flex-grow space-y-5">
        
        {/* Summary */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Generated Summary</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
            <span className="text-violet-400 font-medium">AI Analysis: </span> 
            Detected <span className="text-red-400 font-medium">SSH Brute Force pattern</span> from IP 
            <span className="text-cyan-300 font-mono text-xs mx-1">192.168.45.12</span> targeting user 'root'. 
            Pattern matches 'Hydra' tool signature. 450 failed attempts in 2 minutes.
          </p>
        </div>

        {/* IOCs */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Extracted IOCs</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700/50 text-xs text-cyan-300 font-mono">
              <Globe className="w-3 h-3 text-slate-500" />
              <span>192.168.45.12</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700/50 text-xs text-amber-300 font-mono">
              <User className="w-3 h-3 text-slate-500" />
              <span>root</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700/50 text-xs text-pink-300 font-mono">
               <Terminal className="w-3 h-3 text-slate-500" />
               <span>Tool: Hydra</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Recommended Action</h4>
          <div className="grid grid-cols-2 gap-3">
             <Button variant="primary" size="sm" className="w-full bg-cyan-600 hover:bg-cyan-500 border-none shadow-none text-white">
                Block IP
             </Button>
             <Button variant="secondary" size="sm" className="w-full">
                Escalate
             </Button>
          </div>
        </div>

      </div>
      
      {/* Decorative background flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
};

export default LLMInsightPanel;
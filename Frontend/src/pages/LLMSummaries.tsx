
import React from 'react';
import { Bot, Sparkles, Terminal, FileText, Clock, ArrowRight, Zap, Copy } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const LLMSummaries: React.FC = () => {
  // Mock Data for Summaries
  const summaryFeed = [
    {
      id: "SUM-8821",
      alertType: "SSH Brute Force",
      time: "2 mins ago",
      rawLog: `Oct 24 14:22:01 server-01 sshd[2412]: Failed password for root from 192.168.45.12 port 44212 ssh2\nOct 24 14:22:03 server-01 sshd[2412]: Failed password for root from 192.168.45.12 port 44212 ssh2\n... (Repeated 450 times)`,
      aiSummary: "Detected persistent SSH brute force attack from 192.168.45.12 targeting 'root'. Attack signature resembles 'Hydra' tool usage due to rapid connection cycling. High confidence of automated attack.",
      tags: ["High Severity", "Auth Failure", "Internal IP"],
      tokenCost: "142 tokens"
    },
    {
      id: "SUM-8815",
      alertType: "Encoded PowerShell",
      time: "45 mins ago",
      rawLog: `Process Create:\nRuleName: -\nUtcTime: 2023-10-24 13:40:12.123\nProcessId: 4120\nImage: C:\\Windows\\System32\\powershell.exe\nCommandLine: powershell.exe -e JABzACAAPQAgAE4AZQB3...`,
      aiSummary: "Decoded Base64 PowerShell command reveals an attempt to download a file from external IP 45.33.22.11 (Malicious Reputation). The script attempts to execute a known trojan dropper 'Emotet'.",
      tags: ["Critical", "Malware", "Obfuscation"],
      tokenCost: "256 tokens"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Bot className="mr-3 text-violet-500" />
            LLM Context Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generative AI summaries of complex raw logs to accelerate triage.
          </p>
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                 <div className="text-xs text-slate-500 uppercase tracking-wider">Est. Time Saved</div>
                 <div className="text-lg font-bold text-violet-400">~12.5 hrs</div>
             </div>
             <div className="text-right hidden sm:block border-l border-slate-700 pl-4">
                 <div className="text-xs text-slate-500 uppercase tracking-wider">Tokens Used</div>
                 <div className="text-lg font-bold text-slate-200">45k</div>
             </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="space-y-6">
        {summaryFeed.map((item) => (
          <div key={item.id} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all">
            {/* Card Header */}
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Badge label={item.id} type="purple" outline />
                <h3 className="text-slate-200 font-semibold">{item.alertType}</h3>
                <span className="text-xs text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {item.time}
                </span>
              </div>
              <div className="flex gap-2">
                 {item.tags.map(tag => (
                     <span key={tag} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700/50">{tag}</span>
                 ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Raw Data */}
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-700/50 bg-slate-900/20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                            <Terminal className="w-3 h-3 mr-2" /> Raw Log Data
                        </h4>
                        <button className="text-slate-500 hover:text-slate-300">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-400 whitespace-pre-wrap h-full border border-slate-800 shadow-inner overflow-x-auto">
                        {item.rawLog}
                    </div>
                </div>

                {/* Right: AI Insight */}
                <div className="p-6 relative bg-gradient-to-br from-slate-800/20 to-violet-900/5">
                     <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center">
                            <Sparkles className="w-3 h-3 mr-2" /> AI Analysis
                        </h4>
                        <span className="text-[10px] text-slate-500">{item.tokenCost}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                        {item.aiSummary}
                    </p>

                    <div className="mt-6 pt-4 border-t border-slate-700/30 flex justify-end gap-3">
                         <Button variant="ghost" size="sm" className="text-xs">
                             Not Helpful
                         </Button>
                         <Button variant="secondary" size="sm" className="text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                             <Zap className="w-3 h-3 mr-2" />
                             Run Investigation
                         </Button>
                    </div>
                    
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading/Empty State Mock */}
      <div className="border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500">
          <Bot className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm">Waiting for new incoming alerts to process...</p>
      </div>

    </div>
  );
};

export default LLMSummaries;


import React, { useState } from 'react';
import { Database, Shield, Globe, FileCode, Hash, Search, Filter, ExternalLink, RefreshCw, CheckCircle, AlertOctagon } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const IOCExtraction: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  // Mock IOC Data
  const iocs = [
    {
      id: 1,
      value: "192.168.45.12",
      type: "IP Address",
      riskScore: 92,
      riskLevel: "Critical",
      source: "SSH Brute Force (#8821)",
      enrichment: "Known Botnet (AbuseIPDB)",
      lastSeen: "2 mins ago",
      status: "Active"
    },
    {
      id: 2,
      value: "bad-domain.xyz",
      type: "Domain",
      riskScore: 78,
      riskLevel: "High",
      source: "DNS Query Log",
      enrichment: "Newly Registered Domain",
      lastSeen: "15 mins ago",
      status: "Blocked"
    },
    {
      id: 3,
      value: "a4f5c2...9b12",
      type: "File Hash (SHA256)",
      riskScore: 100,
      riskLevel: "Critical",
      source: "Endpoint Protection",
      enrichment: "Trojan.Emotet (VirusTotal)",
      lastSeen: "1 hour ago",
      status: "Quarantined"
    },
    {
      id: 4,
      value: "admin_backup",
      type: "User Account",
      riskScore: 45,
      riskLevel: "Medium",
      source: "Privilege Escalation",
      enrichment: "Internal User (HR Dept)",
      lastSeen: "3 hours ago",
      status: "Monitoring"
    },
    {
      id: 5,
      value: "45.33.22.11",
      type: "IP Address",
      riskScore: 88,
      riskLevel: "High",
      source: "Firewall Deny",
      enrichment: "C2 Server List",
      lastSeen: "10 mins ago",
      status: "Blocked"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'IP Address': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'Domain': return <Globe className="w-4 h-4 text-violet-400" />;
      case 'File Hash (SHA256)': return <Hash className="w-4 h-4 text-emerald-400" />;
      case 'User Account': return <Shield className="w-4 h-4 text-amber-400" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Database className="mr-3 text-cyan-500" />
            IOC Extraction & Enrichment
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated extraction of artifacts from alerts enriched with threat intelligence.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
             <Button variant="secondary" size="sm" className="flex items-center gap-2">
                 <RefreshCw size={14} /> Re-Scan Active
             </Button>
             <Button variant="primary" size="sm">
                 Export STIX/TAXII
             </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
           <div>
               <div className="text-xs text-slate-500 uppercase font-semibold">Total IOCs (24h)</div>
               <div className="text-2xl font-bold text-white mt-1">1,240</div>
           </div>
           <Database className="text-slate-600 w-8 h-8" />
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
           <div>
               <div className="text-xs text-slate-500 uppercase font-semibold">Malicious</div>
               <div className="text-2xl font-bold text-red-400 mt-1">86</div>
           </div>
           <AlertOctagon className="text-red-500/30 w-8 h-8" />
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
           <div>
               <div className="text-xs text-slate-500 uppercase font-semibold">Auto-Blocked</div>
               <div className="text-2xl font-bold text-emerald-400 mt-1">64</div>
           </div>
           <Shield className="text-emerald-500/30 w-8 h-8" />
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
           <div>
               <div className="text-xs text-slate-500 uppercase font-semibold">Enrichment Rate</div>
               <div className="text-2xl font-bold text-violet-400 mt-1">99.8%</div>
           </div>
           <RefreshCw className="text-violet-500/30 w-8 h-8" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                {['All', 'IP Addresses', 'Domains', 'Hashes', 'Emails'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            activeTab === tab 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search IOCs..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <button className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-lg">
                    <Filter className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700">
                        <th className="p-4 font-medium">Artifact Value</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Reputation Score</th>
                        <th className="p-4 font-medium">Enrichment Source</th>
                        <th className="p-4 font-medium">Related Alert</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-700/30">
                    {iocs.map((ioc) => (
                        <tr key={ioc.id} className="group hover:bg-slate-700/20 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-slate-800 rounded border border-slate-700 group-hover:border-slate-600 transition-colors">
                                        {getIcon(ioc.type)}
                                    </div>
                                    <span className="font-mono text-slate-200">{ioc.value}</span>
                                </div>
                            </td>
                            <td className="p-4 text-slate-400">{ioc.type}</td>
                            <td className="p-4">
                                <div className="flex items-center space-x-2">
                                    <div className={`text-sm font-bold ${ioc.riskScore > 80 ? 'text-red-400' : ioc.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {ioc.riskScore}/100
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${ioc.riskScore > 80 ? 'bg-red-500' : ioc.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${ioc.riskScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase">{ioc.riskLevel}</span>
                            </td>
                            <td className="p-4">
                                <span className="flex items-center text-xs text-slate-300">
                                    <CheckCircle className="w-3 h-3 text-emerald-500 mr-1.5" />
                                    {ioc.enrichment}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="text-cyan-400 hover:underline cursor-pointer text-xs">{ioc.source}</span>
                            </td>
                            <td className="p-4 text-right">
                                <button className="text-slate-400 hover:text-cyan-400 p-2 hover:bg-slate-700 rounded transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
      </div>
    </div>
  );
};

export default IOCExtraction;

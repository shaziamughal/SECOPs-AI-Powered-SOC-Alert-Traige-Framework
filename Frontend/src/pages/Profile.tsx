
import React from 'react';
import { User, Shield, Clock, CheckCircle, BarChart, Award, Briefcase, Calendar } from 'lucide-react';
import Badge from '../components/common/Badge';

const Profile: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-cyan-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-slate-900 shadow-xl">
            A
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-100">Admin Analyst</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-sm">
                <span className="flex items-center text-cyan-400 font-medium">
                    <Shield className="w-4 h-4 mr-1.5" /> Level 3 Responder
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5" /> SOC Team Alpha
                </span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <Badge label="GCIH Certified" type="success" outline />
                <Badge label="Threat Hunter" type="info" outline />
                <Badge label="Admin Access" type="purple" outline />
            </div>
          </div>
          
          <div className="flex flex-col gap-2 text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Current Shift Status</div>
              <div className="flex items-center justify-end text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  Active
              </div>
              <div className="text-xs text-slate-400 mt-1">Shift ends in 4h 30m</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-400 text-xs uppercase font-semibold">Cases Closed</span>
                 <CheckCircle className="w-5 h-5 text-cyan-500" />
             </div>
             <div className="text-3xl font-bold text-slate-100">1,248</div>
             <div className="text-xs text-emerald-400 mt-1">Top 5% of team</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-400 text-xs uppercase font-semibold">Avg Triage Time</span>
                 <Clock className="w-5 h-5 text-amber-500" />
             </div>
             <div className="text-3xl font-bold text-slate-100">14m</div>
             <div className="text-xs text-emerald-400 mt-1">↓ 2m vs last month</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-400 text-xs uppercase font-semibold">Investigation Score</span>
                 <BarChart className="w-5 h-5 text-violet-500" />
             </div>
             <div className="text-3xl font-bold text-slate-100">9.8</div>
             <div className="text-xs text-slate-500 mt-1">Based on QA reviews</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-400 text-xs uppercase font-semibold">Shift Streak</span>
                 <Calendar className="w-5 h-5 text-emerald-500" />
             </div>
             <div className="text-3xl font-bold text-slate-100">12</div>
             <div className="text-xs text-slate-500 mt-1">Consecutive days</div>
          </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-slate-200">Recent Audit Log</h3>
              <button className="text-xs text-cyan-400 hover:text-cyan-300">View Full History</button>
          </div>
          <div className="divide-y divide-slate-700/50">
              {[1,2,3,4,5].map((i) => (
                  <div key={i} className="p-4 hover:bg-slate-700/20 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-700/50 p-2 rounded-lg text-slate-400">
                              <Shield size={18} />
                          </div>
                          <div>
                              <div className="text-sm text-slate-200 font-medium">Closed Incident #8821 as False Positive</div>
                              <div className="text-xs text-slate-500 mt-0.5">Automated ML confidence verification confirmed by analyst.</div>
                          </div>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                          Today, 14:3{i}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Profile;

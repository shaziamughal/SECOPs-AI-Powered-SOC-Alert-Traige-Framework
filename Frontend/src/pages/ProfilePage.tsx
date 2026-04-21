import React, { useEffect, useState } from 'react';
import { Shield, User as UserIcon } from 'lucide-react';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { StatsResponse } from '../types';

const emptyStats: StatsResponse = {
  total_alerts: 0,
  critical_alerts: 0,
  high_alerts: 0,
  false_positives: 0,
  llm_enriched: 0,
  open_alerts: 0,
  investigating_alerts: 0,
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse>(emptyStats);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await api.getStats());
      } catch {
        setStats(emptyStats);
      }
    };
    void load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-cyan-600 flex items-center justify-center text-3xl font-bold text-white">
            {(user?.display_name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{user?.display_name || 'Analyst'}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
              <span className="flex items-center"><Shield className="w-4 h-4 mr-1.5 text-cyan-400" /> {user?.role || 'operator'}</span>
              <span>{user?.username}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge label="Backend Auth" type="success" outline />
              <Badge label="Wazuh Linked" type="info" outline />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-semibold">Open Alerts</div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{stats.open_alerts}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-semibold">Investigating</div>
          <div className="text-3xl font-bold text-violet-300 mt-2">{stats.investigating_alerts}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-semibold">LLM Enriched</div>
          <div className="text-3xl font-bold text-cyan-300 mt-2">{stats.llm_enriched}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

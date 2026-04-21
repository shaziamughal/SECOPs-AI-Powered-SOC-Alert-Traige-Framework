import React, { useEffect, useState } from 'react';
import { CheckCircle, Flame, Layers, RefreshCw, Wand2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import type { AlertRecord, StatsResponse } from '../types';

const emptyStats: StatsResponse = {
  total_alerts: 0,
  critical_alerts: 0,
  high_alerts: 0,
  false_positives: 0,
  llm_enriched: 0,
  open_alerts: 0,
  investigating_alerts: 0,
};

const severityToBadge = (severity: AlertRecord['severity']) => {
  if (severity === 'Critical') return 'error';
  if (severity === 'High') return 'error';
  if (severity === 'Medium') return 'warning';
  if (severity === 'Low') return 'neutral';
  return 'info';
};

const DashboardPage: React.FC = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState<StatsResponse>(emptyStats);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      const [statsResponse, alertsResponse] = await Promise.all([
        api.getStats(),
        api.getAlerts({ limit: 8 }),
      ]);
      setStats(statsResponse);
      setAlerts(alertsResponse.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (settings.autoRefreshSeconds <= 0) return;
    const interval = window.setInterval(() => {
      void loadDashboard();
    }, settings.autoRefreshSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [settings.autoRefreshSeconds]);

  const runSync = async () => {
    setSyncing(true);
    try {
      await api.syncAlerts(settings.defaultSyncHours);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">SOC Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Live metrics computed from the canonical alerts table.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => void runSync()} disabled={syncing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Wazuh Alerts
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Alerts (24h)" value={String(stats.total_alerts)} subtext="All ingested alerts" colorClass="text-cyan-400" icon={<Layers className="w-6 h-6" />} />
        <StatsCard title="Critical + High" value={String(stats.critical_alerts + stats.high_alerts)} subtext="Priority triage queue" colorClass="text-red-400" icon={<Flame className="w-6 h-6" />} />
        <StatsCard title="False Positives" value={String(stats.false_positives)} subtext="Classified by backend ML" colorClass="text-emerald-400" icon={<CheckCircle className="w-6 h-6" />} />
        <StatsCard title="Enriched by LLM" value={String(stats.llm_enriched)} subtext="Summary + IOCs + plan" colorClass="text-violet-400" icon={<Wand2 className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Operational Snapshot</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900/60 rounded-lg p-4">
              <div className="text-slate-500">Open Alerts</div>
              <div className="text-2xl font-bold text-cyan-300">{stats.open_alerts}</div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-4">
              <div className="text-slate-500">Investigating</div>
              <div className="text-2xl font-bold text-violet-300">{stats.investigating_alerts}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Alerts</h2>
          {loading ? (
            <div className="text-slate-400">Loading dashboard data...</div>
          ) : alerts.length === 0 ? (
            <div className="text-slate-400">No alerts synced yet. Run a Wazuh sync to populate the dashboard.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{alert.rule_description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {alert.external_alert_id} • {alert.agent_name || 'Unknown agent'} • {alert.source_ip || 'No source IP'}
                      </div>
                    </div>
                    <Badge label={alert.severity} type={severityToBadge(alert.severity) as any} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

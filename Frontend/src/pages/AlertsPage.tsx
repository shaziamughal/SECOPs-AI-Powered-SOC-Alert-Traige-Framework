import React, { useEffect, useState } from 'react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import type { AlertRecord } from '../types';

const badgeType = (severity: AlertRecord['severity']) => {
  if (severity === 'Critical' || severity === 'High') return 'error';
  if (severity === 'Medium') return 'warning';
  if (severity === 'Low') return 'neutral';
  return 'info';
};

const AlertsPage: React.FC = () => {
  const { settings } = useSettings();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.getAlerts({ limit: 50, search, severity, status });
      setAlerts(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, [search, severity, status]);

  useEffect(() => {
    if (settings.autoRefreshSeconds <= 0) return;
    const interval = window.setInterval(() => {
      void loadAlerts();
    }, settings.autoRefreshSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [search, severity, settings.autoRefreshSeconds, status]);

  const updateStatus = async (id: number, nextStatus: string) => {
    await api.updateAlert(id, { status: nextStatus });
    await loadAlerts();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alert Console</h1>
          <p className="text-slate-400 text-sm mt-1">Filter, triage, and update alerts stored in PostgreSQL.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void loadAlerts()}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts..." className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
          <option value="">All severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Info">Info</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
          <option value="">All statuses</option>
          <option value="new">new</option>
          <option value="triaged">triaged</option>
          <option value="investigating">investigating</option>
          <option value="closed">closed</option>
        </select>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-slate-400">No alerts matched the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <th className="p-4">Alert ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">ML</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-700/20">
                    <td className="p-4 font-mono text-cyan-400">{alert.external_alert_id}</td>
                    <td className="p-4"><Badge label={alert.severity} type={badgeType(alert.severity) as any} /></td>
                    <td className="p-4 text-slate-200">{alert.rule_description}</td>
                    <td className="p-4 text-slate-400">{alert.source_ip || alert.agent_name || 'n/a'}</td>
                    <td className="p-4 text-slate-300">{alert.status}</td>
                    <td className="p-4 text-slate-300">
                      {alert.ml_confidence != null ? `${Math.round(alert.ml_confidence * 100)}%` : 'Unclassified'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => void updateStatus(alert.id, 'investigating')}>Investigate</Button>
                      <Button variant="ghost" size="sm" onClick={() => void updateStatus(alert.id, 'closed')}>Close</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;

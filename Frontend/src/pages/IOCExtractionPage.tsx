import React, { useEffect, useMemo, useState } from 'react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';
import type { AlertRecord, IOCItem } from '../types';

const IOCExtractionPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const response = await api.getAlerts({ limit: 50 });
        setAlerts(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load IOC data');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const iocs = useMemo(() => {
    const rows: Array<IOCItem & { alertId: string; severity: string }> = [];
    alerts.forEach((alert) => {
      (alert.iocs_extracted || []).forEach((ioc) => {
        rows.push({
          ...ioc,
          alertId: alert.external_alert_id,
          severity: alert.severity,
        });
      });
    });
    return rows;
  }, [alerts]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">IOC Extraction & Enrichment</h1>
        <p className="text-sm text-slate-400 mt-1">IOCs are populated by the backend enrichment pipeline and stored on each alert.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading IOC catalog...</div>
        ) : iocs.length === 0 ? (
          <div className="p-6 text-slate-400">No extracted IOCs yet. Run enrichment on alerts to populate this view.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700">
                <th className="p-4">IOC</th>
                <th className="p-4">Type</th>
                <th className="p-4">Source Alert</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-sm">
              {iocs.map((ioc) => (
                <tr key={`${ioc.alertId}-${ioc.type}-${ioc.value}`} className="hover:bg-slate-700/20">
                  <td className="p-4 font-mono text-slate-200">{ioc.value}</td>
                  <td className="p-4 text-slate-400">{ioc.type}</td>
                  <td className="p-4 text-cyan-400">{ioc.alertId}</td>
                  <td className="p-4"><Badge label={ioc.severity} type={ioc.severity === 'Medium' ? 'warning' : ioc.severity === 'Low' ? 'neutral' : 'error'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IOCExtractionPage;

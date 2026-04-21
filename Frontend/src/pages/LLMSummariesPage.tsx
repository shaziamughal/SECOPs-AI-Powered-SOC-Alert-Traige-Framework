import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import type { AlertRecord, EnrichmentResponse } from '../types';

const LLMSummariesPage: React.FC = () => {
  const { settings } = useSettings();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [results, setResults] = useState<Record<number, EnrichmentResponse>>({});
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [enrichmentState, setEnrichmentState] = useState<'all' | 'enriched' | 'not_enriched'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.getAlerts({
        limit: 50,
        search: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
      });
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
  }, [search, severity, status, settings.autoRefreshSeconds]);

  const enrich = async (alertId: number) => {
    const result = await api.enrichAlert(alertId);
    setResults((current) => ({ ...current, [alertId]: result }));
    await loadAlerts();
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const isEnriched = Boolean(alert.llm_summary || alert.llm_enriched_at || results[alert.id]?.llm_summary);
      if (enrichmentState === 'enriched') return isEnriched;
      if (enrichmentState === 'not_enriched') return !isEnriched;
      return true;
    });
  }, [alerts, enrichmentState, results]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">LLM Context Engine</h1>
        <p className="text-sm text-slate-400 mt-1">Generate backend-managed summaries, IOCs, and investigation plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search alerts..."
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Info">Info</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All statuses</option>
          <option value="new">new</option>
          <option value="triaged">triaged</option>
          <option value="investigating">investigating</option>
          <option value="closed">closed</option>
        </select>
        <select
          value={enrichmentState}
          onChange={(e) => setEnrichmentState(e.target.value as 'all' | 'enriched' | 'not_enriched')}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value="all">All enrichment states</option>
          <option value="enriched">Enriched only</option>
          <option value="not_enriched">Not enriched</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => void loadAlerts()}>
          Refresh
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">{error}</div>}

      <div className="space-y-4">
        {loading ? (
          <div className="text-slate-400">Loading enrichment queue...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-slate-400">No alerts matched the current filters.</div>
        ) : (
          filteredAlerts.map((alert) => {
            const iocs = alert.iocs_extracted || results[alert.id]?.iocs_extracted || [];
            const plan = alert.investigation_plan || results[alert.id]?.investigation_plan || [];
            return (
              <div key={alert.id} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-slate-100 font-semibold">{alert.rule_description}</div>
                    <div className="text-xs text-slate-500 mt-1">{alert.external_alert_id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge label={alert.severity} type={alert.severity === 'Medium' ? 'warning' : alert.severity === 'Low' ? 'neutral' : 'purple'} />
                    <Button variant="secondary" size="sm" onClick={() => void enrich(alert.id)}>
                      Enrich Alert
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-700/50 bg-slate-900/20">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Extracted IOCs</h4>
                    {iocs.length === 0 ? (
                      <div className="text-sm text-slate-500">No IOCs extracted yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {iocs.map((ioc) => (
                          <div key={`${ioc.type}-${ioc.value}`} className="text-sm text-slate-300 font-mono">
                            {ioc.type}: {ioc.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-gradient-to-br from-slate-800/20 to-violet-900/5">
                    <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">AI Analysis</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {alert.llm_summary || results[alert.id]?.llm_summary || 'No summary generated yet.'}
                    </p>
                    {plan.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Investigation Plan</div>
                        <ol className="list-decimal ml-4 space-y-1 text-sm text-slate-300">
                          {plan.map((step) => <li key={step}>{step}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LLMSummariesPage;

import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { api } from '../services/api';
import type { AlertRecord, ClassificationResponse } from '../types';

const MLClassificationPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [results, setResults] = useState<Record<number, ClassificationResponse>>({});
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [classificationStatus, setClassificationStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setError(null);
      const response = await api.getAlerts({ limit: 50 });
      setAlerts(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  const runClassification = async (alertId: number) => {
    const result = await api.classifyAlert(alertId);
    setResults((current) => ({ ...current, [alertId]: result }));
    await loadAlerts();
  };

  const retryPending = async () => {
    setRetrying(true);
    try {
      await api.retryPendingClassifications(50);
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry pending classifications');
    } finally {
      setRetrying(false);
    }
  };

  const renderStatus = (alert: AlertRecord): string => {
    if (alert.ml_classification_status === 'pending') return 'Pending Retry';
    if (alert.ml_classification_status === 'failed') return 'Failed';
    if (alert.is_false_positive == null) return 'Unclassified';
    return alert.is_false_positive ? 'False Positive' : 'Actionable';
  };

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const isEnrichedResult = results[alert.id];
      const normalizedStatus = alert.ml_classification_status;
      const label = renderStatus(alert).toLowerCase();
      const haystack = [
        alert.external_alert_id,
        alert.rule_description,
        alert.source_ip || '',
        alert.agent_name || '',
        alert.ml_classifier_provider || '',
        normalizedStatus,
        label,
      ]
        .join(' ')
        .toLowerCase();

      if (query && !haystack.includes(query)) return false;
      if (severity && alert.severity !== severity) return false;
      if (classificationStatus && normalizedStatus !== classificationStatus) return false;

      // Keep freshly classified results in the queue unless the user filters them out.
      if (classificationStatus === 'classified' && !isEnrichedResult && alert.ml_classification_status !== 'classified') {
        return false;
      }

      return true;
    });
  }, [alerts, classificationStatus, results, search, severity]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">ML Classification Engine</h1>
        <p className="text-sm text-slate-400 mt-1">Run backend classification and review false-positive confidence in place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          value={classificationStatus}
          onChange={(e) => setClassificationStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value="">All classification states</option>
          <option value="unclassified">Unclassified</option>
          <option value="pending">Pending Retry</option>
          <option value="failed">Failed</option>
          <option value="classified">Classified</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => void loadAlerts()}>
          Refresh
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading classification queue...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-6 text-slate-400">No alerts matched the current filters.</div>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {filteredAlerts.map((alert) => {
              const result = results[alert.id];
              return (
                <div key={alert.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cyan-400">{alert.external_alert_id}</span>
                      <Badge label={alert.severity} type={alert.severity === 'Medium' ? 'warning' : alert.severity === 'Low' ? 'neutral' : 'error'} />
                    </div>
                    <div className="text-slate-100 font-medium mt-2">{alert.rule_description}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Current confidence:{' '}
                      {alert.ml_confidence != null ? `${Math.round(alert.ml_confidence * 100)}%` : 'not classified yet'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Engine: {alert.ml_classifier_provider || 'not set'} | Attempts: {alert.ml_classification_attempts}
                    </div>
                    {result && <div className="text-sm text-slate-400 mt-2">{result.reasoning}</div>}
                    {alert.ml_classification_last_error && (
                      <div className="text-xs text-amber-300 mt-2">Last error: {alert.ml_classification_last_error}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {alert.ml_classification_status === 'pending' || alert.ml_classification_status === 'failed' ? (
                      <Button variant="ghost" size="sm" onClick={() => void runClassification(alert.id)}>
                        {renderStatus(alert)}
                      </Button>
                    ) : (
                      <span className="text-sm text-slate-300">
                        {renderStatus(alert)}
                      </span>
                    )}
                    <Button variant="primary" size="sm" onClick={() => void runClassification(alert.id)}>
                      {alert.ml_classification_status === 'pending' ? 'Retry Now' : 'Run Classification'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLClassificationPage;

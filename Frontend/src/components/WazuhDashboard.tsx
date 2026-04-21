
import React, { useEffect, useState } from 'react';
import { wazuhService, WazuhLog } from '../services/wazuhService';
import { Shield, Server, AlertTriangle, RefreshCw, Terminal, Activity } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

type SeverityFilter = 'low' | 'medium' | 'high' | 'critical';

const DEFAULT_SEVERITY_FILTERS: SeverityFilter[] = ['low', 'medium', 'high', 'critical'];

const WazuhDashboard: React.FC = () => {
    const { settings } = useSettings();
    const [logs, setLogs] = useState<WazuhLog[]>([]);
    const [agents, setAgents] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeverities, setSelectedSeverities] = useState<SeverityFilter[]>(DEFAULT_SEVERITY_FILTERS);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsData, agentsData] = await Promise.all([
                wazuhService.getLogs(50),
                wazuhService.getAgents()
            ]);

            // Wazuh logs structure might vary, adapting to response
            if (logsData?.data?.affected_items) {
                setLogs(logsData.data.affected_items);
            }

            if (agentsData?.data?.affected_items) {
                setAgents(agentsData.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    useEffect(() => {
        if (settings.autoRefreshSeconds <= 0) return;
        const interval = window.setInterval(() => {
            void fetchData();
        }, settings.autoRefreshSeconds * 1000);
        return () => window.clearInterval(interval);
    }, [settings.autoRefreshSeconds]);

    const getLevelColor = (level: any) => {
        // Handle numeric levels (Alerts)
        if (typeof level === 'number') {
            if (level >= 12) return 'text-red-500 bg-red-500/10 border-red-500/20';
            if (level >= 7) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            if (level >= 4) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }

        // Handle string levels (Manager logs)
        const sLevel = String(level).toLowerCase();
        if (sLevel.includes('crit') || sLevel.includes('error')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (sLevel.includes('warn')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        if (sLevel.includes('info')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    const getRawSource = (log: any) => log?._source ?? log;

    const getLogLevel = (log: any) => {
        const source = getRawSource(log);
        return source?.rule?.level ?? source?.level ?? 0;
    };

    const getLogDescription = (log: any) => {
        const source = getRawSource(log);
        return source?.rule?.description ?? source?.description ?? source?.full_log ?? 'No description';
    };

    const getLogAgent = (log: any) => {
        const source = getRawSource(log);
        return source?.agent?.name ?? (source?.tag ? `Manager (${source.tag})` : 'System');
    };

    const getLogRuleId = (log: any) => {
        const source = getRawSource(log);
        return source?.rule?.id ?? (source?.tag ? source.tag.split(':')[0] : 'N/A');
    };

    const getLogTimestamp = (log: any) => {
        const source = getRawSource(log);
        return source?.timestamp ?? log?.timestamp;
    };

    const getSeverityCategory = (log: any): SeverityFilter | 'info' => {
        const level = getLogLevel(log);

        if (typeof level === 'number') {
            if (level >= 12) return 'critical';
            if (level >= 7) return 'high';
            if (level >= 4) return 'medium';
            if (level >= 3) return 'low';
            return 'info';
        }

        const text = String(level).toLowerCase();
        if (text.includes('crit') || text.includes('error')) return 'critical';
        if (text.includes('high') || text.includes('warn')) return 'high';
        if (text.includes('medium')) return 'medium';
        if (text.includes('low')) return 'low';
        return 'info';
    };

    const toggleSeverity = (severity: SeverityFilter) => {
        setSelectedSeverities((prev) => {
            if (prev.includes(severity)) {
                return prev.filter((value) => value !== severity);
            }
            return [...prev, severity];
        });
    };

    const filteredLogs = logs.filter((log) => {
        const severity = getSeverityCategory(log);
        if (severity === 'info') return false;
        return selectedSeverities.includes(severity);
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Shield className="w-8 h-8 text-cyan-400" />
                        Wazuh Security Monitor
                    </h1>
                    <p className="text-slate-400 mt-2">Real-time security events and agent status from Wazuh Manager</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all border border-cyan-500/20 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Server className="w-4 h-4" />
                        <span>Total Agents</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {agents?.total_affected_items || 0}
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span>Active Agents</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {agents?.affected_items?.filter((a: any) => a.status === 'active').length || 0}
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>High Severity (Last 50)</span>
                    </div>
                    <div className="text-2xl font-bold text-red-100">
                        {filteredLogs.filter(l => {
                            const level = getLogLevel(l);
                            if (typeof level === 'number') return level >= 10;
                            return String(level).toLowerCase().includes('error') || String(level).toLowerCase().includes('crit');
                        }).length}
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Terminal className="w-4 h-4" />
                        <span>Total Events</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                        {filteredLogs.length}
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-cyan-400" />
                        Recent Security Events
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Last 50 events</span>
                        {DEFAULT_SEVERITY_FILTERS.map((severity) => {
                            const active = selectedSeverities.includes(severity);
                            return (
                                <button
                                    key={severity}
                                    onClick={() => toggleSeverity(severity)}
                                    className={`px-2 py-1 rounded-md text-xs uppercase border transition-colors ${active
                                        ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10'
                                        : 'text-slate-400 border-slate-600 hover:text-slate-200 hover:border-slate-500'
                                        }`}
                                >
                                    {severity}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-slate-700">Level</th>
                                <th className="p-4 font-medium border-b border-slate-700">Time</th>
                                <th className="p-4 font-medium border-b border-slate-700">Agent</th>
                                <th className="p-4 font-medium border-b border-slate-700">Description</th>
                                <th className="p-4 font-medium border-b border-slate-700">Rule ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                        No alerts match the selected severity filters
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log: any, index: number) => {
                                    const level = getLogLevel(log) ?? 'N/A';
                                    const description = getLogDescription(log);
                                    const agent = getLogAgent(log);
                                    const ruleId = getLogRuleId(log);
                                    const timestamp = getLogTimestamp(log);
                                    const source = getRawSource(log);

                                    return (
                                        <tr key={log._id || source?.id || index} className="hover:bg-slate-700/20 transition-colors group">
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border uppercase ${getLevelColor(level)}`}>
                                                    {typeof level === 'number' ? `Level ${level}` : level}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                                                {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-slate-300 font-medium">
                                                {agent}
                                                {source?.agent?.id && <span className="text-slate-500 text-xs ml-1">({source.agent.id})</span>}
                                            </td>
                                            <td className="p-4 text-slate-200 max-w-lg">
                                                <div className="truncate group-hover:whitespace-normal group-hover:overflow-visible">
                                                    {description}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm font-mono">
                                                {ruleId}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WazuhDashboard;

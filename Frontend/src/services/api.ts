import type {
  AlertListResponse,
  AlertRecord,
  AuthResponse,
  ClassificationResponse,
  EnrichmentResponse,
  StatsResponse,
  SyncResponse,
  WazuhAgentsResponse,
  WazuhIndexerAlertResponse,
  WazuhLogResponse,
} from '../types';

const DEFAULT_API_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${DEFAULT_API_HOST}:8000/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = 'Request failed';
    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<AuthResponse>('/auth/logout', {
      method: 'POST',
    }),

  me: () => request<AuthResponse>('/auth/me'),

  getAlerts: (params: { limit?: number; offset?: number; severity?: string; status?: string; search?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.limit) search.set('limit', String(params.limit));
    if (params.offset) search.set('offset', String(params.offset));
    if (params.severity) search.set('severity', params.severity);
    if (params.status) search.set('status', params.status);
    if (params.search) search.set('search', params.search);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return request<AlertListResponse>(`/alerts${suffix}`);
  },

  getAlert: (id: number) => request<AlertRecord>(`/alerts/${id}`),

  updateAlert: (id: number, payload: { status?: string; action_taken?: string; analyst_notes?: string }) =>
    request<AlertRecord>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  classifyAlert: (id: number) =>
    request<ClassificationResponse>(`/alerts/${id}/classify`, {
      method: 'POST',
    }),

  retryPendingClassifications: (limit: number = 50) =>
    request<{ processed: number; classified: number; pending: number; failed: number }>(
      `/alerts/classify/retry-pending?limit=${limit}`,
      {
        method: 'POST',
      },
    ),

  enrichAlert: (id: number) =>
    request<EnrichmentResponse>(`/alerts/${id}/enrich`, {
      method: 'POST',
    }),

  syncAlerts: (hours: number = 24, limit: number = 200) =>
    request<SyncResponse>(`/wazuh/sync?hours=${hours}&limit=${limit}`, {
      method: 'POST',
    }),

  getStats: (hours: number = 24) =>
    request<StatsResponse>(`/wazuh/stats?hours=${hours}`),

  getWazuhLogs: (limit: number = 25) =>
    request<WazuhLogResponse>(`/wazuh/logs?limit=${limit}`),

  getWazuhAgents: () =>
    request<WazuhAgentsResponse>('/wazuh/agents'),

  getWazuhIndexerAlerts: (limit: number = 50) =>
    request<WazuhIndexerAlertResponse>(`/wazuh/indexer-alerts?limit=${limit}`),
};

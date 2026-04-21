import type { ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  display_name: string;
  role: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

export interface IOCItem {
  type: string;
  value: string;
}

export interface AlertRecord {
  id: number;
  external_alert_id: string;
  timestamp: string;
  rule_id: string | null;
  rule_level: number | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  rule_description: string;
  source_ip: string | null;
  agent_name: string | null;
  status: string;
  raw_data: Record<string, unknown> | null;
  is_false_positive: boolean | null;
  ml_confidence: number | null;
  ml_prediction_time: string | null;
  ml_classification_status: 'unclassified' | 'pending' | 'classified' | 'failed';
  ml_classification_attempts: number;
  ml_classification_last_error: string | null;
  ml_classification_next_retry_at: string | null;
  ml_classifier_provider: string | null;
  llm_summary: string | null;
  iocs_extracted: IOCItem[] | null;
  investigation_plan: string[] | null;
  llm_enriched_at: string | null;
  action_taken: string | null;
  analyst_notes: string | null;
}

export interface AlertListResponse {
  items: AlertRecord[];
  total: number;
}

export interface StatsResponse {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  false_positives: number;
  llm_enriched: number;
  open_alerts: number;
  investigating_alerts: number;
}

export interface ClassificationResponse {
  alert_id: number;
  classification_status: 'pending' | 'classified' | 'failed';
  is_false_positive: boolean | null;
  ml_confidence: number | null;
  reasoning: string;
  provider: string;
}

export interface EnrichmentResponse {
  alert_id: number;
  llm_summary: string;
  iocs_extracted: IOCItem[];
  investigation_plan: string[];
  provider: string;
}

export interface SyncResponse {
  status: string;
  message: string;
  new_alerts: number;
  updated_alerts: number;
  total_processed: number;
  auto_classified: number;
  pending_classification: number;
}

export interface WazuhLog {
  id?: string;
  timestamp: string;
  rule?: {
    level?: number;
    description?: string;
    id?: string;
  };
  agent?: {
    name?: string;
    id?: string;
  };
  level?: string | number;
  tag?: string;
  description?: string;
  full_log?: string;
}

export interface WazuhLogResponse {
  data?: {
    affected_items?: WazuhLog[];
    total_affected_items?: number;
  };
}

export interface WazuhAgent {
  id?: string;
  name?: string;
  status?: string;
}

export interface WazuhAgentsResponse {
  data?: {
    affected_items?: WazuhAgent[];
    total_affected_items?: number;
  };
}

export interface WazuhIndexerAlertResponse {
  data?: {
    affected_items?: WazuhLog[];
    total_affected_items?: number;
  };
}

// Legacy view types kept temporarily so older unused demo components still compile.
export interface Alert {
  id: string;
  severity: 'High' | 'Medium' | 'Low' | 'Info';
  rule: string;
  sourceIp: string;
  mlClass: 'TP' | 'FP' | 'Uncertain';
  mlConfidence: number;
  action: 'Auto-Closed' | 'Escalate' | 'Block' | 'None';
  timestamp: string;
}

export interface StatMetric {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  subtext?: string;
  icon?: ReactNode;
  colorClass?: string;
}

export interface TrendData {
  time: string;
  totalEvents: number;
  highSeverity: number;
}

import type { AlertRecord } from '../types';

export type NotificationFilter = 'all' | 'unread' | 'critical' | 'system';
export type NotificationType = 'critical' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  alertId: number;
  title: string;
  message: string;
  type: NotificationType;
  category: 'critical' | 'high' | 'system';
  timestamp: string;
}

const READ_STORAGE_KEY = 'soc-notifications-read';
const DISMISSED_STORAGE_KEY = 'soc-notifications-dismissed';

const SYSTEM_UPDATE_PATTERNS = [
  /system\s+update/i,
  /security\s+update/i,
  /update\s+required/i,
  /patch/i,
  /upgrade/i,
  /outdated/i,
  /vulnerab/i,
  /cve-/i,
  /package\s+update/i,
];

const safeParseArray = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export const loadReadNotificationIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  return new Set(safeParseArray(window.localStorage.getItem(READ_STORAGE_KEY)));
};

export const loadDismissedNotificationIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  return new Set(safeParseArray(window.localStorage.getItem(DISMISSED_STORAGE_KEY)));
};

export const saveReadNotificationIds = (ids: Set<string>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
};

export const saveDismissedNotificationIds = (ids: Set<string>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
};

const isSystemUpdateAlert = (alert: AlertRecord): boolean => {
  const raw = JSON.stringify(alert.raw_data ?? {});
  return SYSTEM_UPDATE_PATTERNS.some((pattern) =>
    pattern.test(alert.rule_description) || pattern.test(raw),
  );
};

const relativeTime = (timestamp: string): string => {
  const millis = new Date(timestamp).getTime();
  if (Number.isNaN(millis)) return 'Unknown time';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - millis) / 1000));
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hour${Math.floor(diffSeconds / 3600) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffSeconds / 86400)} day${Math.floor(diffSeconds / 86400) > 1 ? 's' : ''} ago`;
};

export const buildNotificationsFromAlerts = (alerts: AlertRecord[]): AppNotification[] => {
  const notifications: AppNotification[] = [];

  for (const alert of alerts) {
    if (alert.severity === 'Critical') {
      notifications.push({
        id: `critical-${alert.id}`,
        alertId: alert.id,
        title: 'Critical alert detected',
        message: `${alert.rule_description} on ${alert.agent_name || 'unknown agent'} (${alert.source_ip || 'no source IP'}).`,
        type: 'critical',
        category: 'critical',
        timestamp: alert.timestamp,
      });
    } else if (alert.severity === 'High') {
      notifications.push({
        id: `high-${alert.id}`,
        alertId: alert.id,
        title: 'High severity alert detected',
        message: `${alert.rule_description} on ${alert.agent_name || 'unknown agent'} (${alert.source_ip || 'no source IP'}).`,
        type: 'warning',
        category: 'high',
        timestamp: alert.timestamp,
      });
    }

    if (isSystemUpdateAlert(alert)) {
      notifications.push({
        id: `system-${alert.id}`,
        alertId: alert.id,
        title: 'System update required',
        message: `${alert.agent_name || 'An asset'} reported update-related risk: ${alert.rule_description}`,
        type: 'info',
        category: 'system',
        timestamp: alert.timestamp,
      });
    }
  }

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const getNotificationTimeLabel = (timestamp: string): string => relativeTime(timestamp);


import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Info, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import Button from '../components/common/Button';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import type { AlertRecord } from '../types';
import {
  buildNotificationsFromAlerts,
  getNotificationTimeLabel,
  loadDismissedNotificationIds,
  loadReadNotificationIds,
  saveDismissedNotificationIds,
  saveReadNotificationIds,
  type AppNotification,
  type NotificationFilter,
} from '../services/notificationService';

const Notifications: React.FC = () => {
  const { settings } = useSettings();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadNotificationIds());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => loadDismissedNotificationIds());

  const loadNotifications = async () => {
    try {
      setError(null);
      const response = await api.getAlerts({ limit: 200 });
      setAlerts(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    if (settings.autoRefreshSeconds <= 0) return;
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, settings.autoRefreshSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [settings.autoRefreshSeconds]);

  useEffect(() => {
    saveReadNotificationIds(readIds);
  }, [readIds]);

  useEffect(() => {
    saveDismissedNotificationIds(dismissedIds);
  }, [dismissedIds]);

  const notifications = useMemo(() => {
    const generated = buildNotificationsFromAlerts(alerts);
    return generated.filter((item) => !dismissedIds.has(item.id));
  }, [alerts, dismissedIds]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)).length,
    [notifications, readIds],
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !readIds.has(item.id);
      if (filter === 'critical') return item.category === 'critical' || item.category === 'high';
      if (filter === 'system') return item.category === 'system';
      return true;
    });
  }, [filter, notifications, readIds]);

  const markAllRead = () => {
    const updated = new Set(readIds);
    notifications.forEach((item) => updated.add(item.id));
    setReadIds(updated);
  };

  const dismissOne = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
  };

  const clearAll = () => {
    const next = new Set(dismissedIds);
    notifications.forEach((item) => next.add(item.id));
    setDismissedIds(next);
  };

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'critical': return <ShieldAlert className="w-5 h-5 text-red-400" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        default: return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
        case 'critical': return 'bg-red-500/10 border-red-500/20';
        case 'warning': return 'bg-amber-500/10 border-amber-500/20';
        default: return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Bell className="mr-3 text-amber-500" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-1">Live feed for Critical/High detections and system update advisories.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="ghost" size="sm" className="text-slate-400" onClick={markAllRead}>Mark all as read</Button>
             <Button variant="secondary" size="sm" onClick={clearAll}>Clear All</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && unreadCount > 0 && (
        <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {unreadCount} unread notification{unreadCount > 1 ? 's' : ''} require review.
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6 flex space-x-6">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'all' ? 'text-white border-cyan-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
              All Notifications
          </button>
          <button 
             onClick={() => setFilter('unread')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'unread' ? 'text-white border-cyan-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
              Unread <span className="ml-1 bg-cyan-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          </button>
          <button 
             onClick={() => setFilter('critical')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'critical' ? 'text-white border-cyan-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
              Critical & High
          </button>
          <button
             onClick={() => setFilter('system')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'system' ? 'text-white border-cyan-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
              System Updates
          </button>
      </div>

      {/* List */}
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-10">
          {loading ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-slate-400">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-slate-400">
              No notifications match this filter.
            </div>
          ) : filteredNotifications.map((item: AppNotification) => {
              const isRead = readIds.has(item.id);
              return (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border flex gap-4 transition-all relative group ${
                    !isRead ? 'bg-slate-800 border-slate-600' : 'bg-slate-900/50 border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                  {!isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-500"></div>}
                  
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgColor(item.type)}`}>
                      {getIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 pr-8">
                      <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-semibold text-sm ${!isRead ? 'text-white' : 'text-slate-300'}`}>{item.title}</h4>
                          <span className="text-xs text-slate-500">{getNotificationTimeLabel(item.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.message}</p>
                      
                      {(item.type === 'critical' || item.type === 'warning') && (
                          <div className="mt-3">
                              <Link to="/alerts" onClick={() => markRead(item.id)}>
                                <Button size="sm" variant={item.type === 'critical' ? 'danger' : 'secondary'} className="py-1 h-auto text-xs">
                                  View Incident
                                </Button>
                              </Link>
                          </div>
                      )}
                  </div>

                  <button
                    onClick={() => dismissOne(item.id)}
                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                      <X size={14} />
                  </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Notifications;

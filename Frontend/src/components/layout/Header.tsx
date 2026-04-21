
import React, { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import {
  buildNotificationsFromAlerts,
  loadDismissedNotificationIds,
  loadReadNotificationIds,
} from '../../services/notificationService';
import type { AlertRecord } from '../../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { resolvedTheme, settings, updateSettings } = useSettings();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadReadNotificationIds());
    setDismissedIds(loadDismissedNotificationIds());
  }, []);

  useEffect(() => {
    const loadAlertSnapshot = async () => {
      try {
        const response = await api.getAlerts({ limit: 200 });
        setAlerts(response.items);
      } catch {
        // Keep header resilient; notification page surfaces detailed fetch errors.
      }
    };

    void loadAlertSnapshot();
    if (settings.autoRefreshSeconds <= 0) return;
    const interval = window.setInterval(() => {
      void loadAlertSnapshot();
      setReadIds(loadReadNotificationIds());
      setDismissedIds(loadDismissedNotificationIds());
    }, settings.autoRefreshSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [settings.autoRefreshSeconds]);

  const unreadNotificationCount = useMemo(() => {
    const notifications = buildNotificationsFromAlerts(alerts).filter((item) => !dismissedIds.has(item.id));
    return notifications.filter((item) => !readIds.has(item.id)).length;
  }, [alerts, dismissedIds, readIds]);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-slate-200 font-semibold text-lg">AI-Powered SOC Alert Triage Framework</h2>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => updateSettings({ themeMode: resolvedTheme === 'dark' ? 'light' : 'dark' })}
          className="text-slate-400 hover:text-white transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {settings.themeMode === 'system' ? (
            <span className="text-xs font-medium uppercase tracking-wide">System</span>
          ) : resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <Link to="/notifications" className="relative cursor-pointer group">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center font-bold border border-slate-900">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex items-center space-x-3 pl-6 border-l border-slate-800 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
              {user?.display_name || 'Analyst'}
            </div>
            <div className="text-[10px] text-slate-500">{user?.role || 'SOC Operator'}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all">
            {(user?.display_name || 'A').slice(0, 1).toUpperCase()}
          </div>
        </Link>
        <button
          onClick={() => void logout()}
          className="text-slate-400 hover:text-white transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;

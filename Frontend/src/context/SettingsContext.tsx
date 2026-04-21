import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'system' | 'dark' | 'light';
type DensityMode = 'comfortable' | 'compact';

interface NotificationPreferences {
  criticalAlerts: boolean;
  syncFailures: boolean;
  enrichmentsComplete: boolean;
}

interface AppSettings {
  themeMode: ThemeMode;
  density: DensityMode;
  autoRefreshSeconds: number;
  defaultSyncHours: number;
  notifications: NotificationPreferences;
}

interface SettingsContextValue {
  settings: AppSettings;
  resolvedTheme: 'dark' | 'light';
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotifications: (updates: Partial<NotificationPreferences>) => void;
  resetSettings: () => void;
}

const STORAGE_KEY = 'soc-triage-settings';

const defaultSettings: AppSettings = {
  themeMode: 'system',
  density: 'comfortable',
  autoRefreshSeconds: 60,
  defaultSyncHours: 24,
  notifications: {
    criticalAlerts: true,
    syncFailures: true,
    enrichmentsComplete: false,
  },
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      return {
        ...defaultSettings,
        ...JSON.parse(raw),
        notifications: {
          ...defaultSettings.notifications,
          ...(JSON.parse(raw).notifications || {}),
        },
      };
    } catch {
      return defaultSettings;
    }
  });
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => setSystemTheme(media.matches ? 'dark' : 'light');
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const resolvedTheme = settings.themeMode === 'system' ? systemTheme : settings.themeMode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = settings.themeMode;
    document.documentElement.dataset.density = settings.density;
  }, [resolvedTheme, settings.density, settings.themeMode]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    resolvedTheme,
    updateSettings: (updates) => setSettings((current) => ({ ...current, ...updates })),
    updateNotifications: (updates) =>
      setSettings((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          ...updates,
        },
      })),
    resetSettings: () => setSettings(defaultSettings),
  }), [resolvedTheme, settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export type { ThemeMode, DensityMode, NotificationPreferences, AppSettings };

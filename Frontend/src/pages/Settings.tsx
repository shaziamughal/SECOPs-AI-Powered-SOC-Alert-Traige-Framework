import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Key,
  Monitor,
  Moon,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sun,
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const ToggleRow: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-700/40 last:border-b-0">
    <div>
      <div className="text-sm font-medium text-slate-200">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </div>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`}
      />
    </button>
  </div>
);

const ThemeButton: React.FC<{
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ active, label, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
      active
        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        : 'bg-slate-900/50 text-slate-300 border-slate-700 hover:border-slate-600'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { settings, resolvedTheme, updateNotifications, updateSettings, resetSettings } = useSettings();
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const integrationItems = useMemo(() => [
    {
      label: 'Authentication',
      value: 'Backend session cookies',
      description: 'Frontend login state is restored from /api/auth/me on refresh.',
    },
    {
      label: 'Theme engine',
      value: `${settings.themeMode} (${resolvedTheme})`,
      description: 'Resolved locally using saved preference plus system preference when selected.',
    },
    {
      label: 'Wazuh connectivity',
      value: 'Backend managed',
      description: 'Indexer ingestion plus Manager API routes are configured server-side.',
    },
    {
      label: 'LLM enrichment',
      value: 'Backend managed',
      description: 'Provider secrets stay on the server and are never exposed to the browser.',
    },
  ], [resolvedTheme, settings.themeMode]);

  const showSaved = (message: string) => {
    setSavedNotice(message);
    window.clearTimeout((showSaved as unknown as { timer?: number }).timer);
    (showSaved as unknown as { timer?: number }).timer = window.setTimeout(() => setSavedNotice(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <SettingsIcon className="mr-3 text-slate-400" />
            System Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Functional preferences for appearance, refresh behavior, and local notification handling.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedNotice && <span className="text-sm text-emerald-400">{savedNotice}</span>}
          <Button variant="secondary" onClick={() => { resetSettings(); showSaved('Settings reset'); }}>
            Reset Defaults
          </Button>
          <Button variant="primary" onClick={() => showSaved('Preferences saved locally')}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-5 flex items-center">
              <Monitor className="mr-2 text-cyan-400" />
              Appearance
            </h2>

            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-slate-200 mb-3">Theme Mode</div>
                <div className="flex flex-wrap gap-3">
                  <ThemeButton active={settings.themeMode === 'system'} label="System" icon={<Monitor className="w-4 h-4" />} onClick={() => updateSettings({ themeMode: 'system' })} />
                  <ThemeButton active={settings.themeMode === 'dark'} label="Dark" icon={<Moon className="w-4 h-4" />} onClick={() => updateSettings({ themeMode: 'dark' })} />
                  <ThemeButton active={settings.themeMode === 'light'} label="Light" icon={<Sun className="w-4 h-4" />} onClick={() => updateSettings({ themeMode: 'light' })} />
                </div>
                <div className="text-xs text-slate-500 mt-3">Resolved theme right now: <span className="text-slate-300">{resolvedTheme}</span></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Layout Density</label>
                  <select
                    value={settings.density}
                    onChange={(e) => updateSettings({ density: e.target.value as 'comfortable' | 'compact' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Auto Refresh</label>
                  <select
                    value={settings.autoRefreshSeconds}
                    onChange={(e) => updateSettings({ autoRefreshSeconds: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                  >
                    <option value={0}>Off</option>
                    <option value={30}>Every 30 seconds</option>
                    <option value={60}>Every 60 seconds</option>
                    <option value={300}>Every 5 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-5 flex items-center">
              <RefreshCw className="mr-2 text-violet-400" />
              Operational Defaults
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Default Wazuh Sync Lookback</label>
                <select
                  value={settings.defaultSyncHours}
                  onChange={(e) => updateSettings({ defaultSyncHours: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  <option value={6}>Last 6 hours</option>
                  <option value={12}>Last 12 hours</option>
                  <option value={24}>Last 24 hours</option>
                  <option value={48}>Last 48 hours</option>
                </select>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Applied today</div>
                <div className="text-sm text-slate-300">Dashboard sync actions use the saved lookback automatically.</div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-5 flex items-center">
              <Bell className="mr-2 text-amber-400" />
              Notifications
            </h2>

            <ToggleRow
              label="Critical Alert Notifications"
              description="Keep local in-app reminders enabled for critical and high severity activity."
              enabled={settings.notifications.criticalAlerts}
              onToggle={() => updateNotifications({ criticalAlerts: !settings.notifications.criticalAlerts })}
            />
            <ToggleRow
              label="Sync Failure Warnings"
              description="Surface notices when Wazuh sync or live data refresh fails."
              enabled={settings.notifications.syncFailures}
              onToggle={() => updateNotifications({ syncFailures: !settings.notifications.syncFailures })}
            />
            <ToggleRow
              label="Enrichment Completion Notices"
              description="Show local notices when LLM enrichment completes successfully."
              enabled={settings.notifications.enrichmentsComplete}
              onToggle={() => updateNotifications({ enrichmentsComplete: !settings.notifications.enrichmentsComplete })}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <Shield className="mr-2 text-cyan-400" />
              Session
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Analyst</span>
                <span className="text-slate-200">{user?.display_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Username</span>
                <span className="text-slate-200">{user?.username || 'Unknown'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Role</span>
                <span className="text-slate-200">{user?.role || 'Unknown'}</span>
              </div>
              <div className="pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                Authentication is backend-managed with HTTP-only cookies. Passwords and provider secrets are not editable from the browser.
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <Key className="mr-2 text-emerald-400" />
              Integration Status
            </h2>
            <div className="space-y-3">
              {integrationItems.map((item) => (
                <div key={item.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                    </div>
                    <div className="flex items-center text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;

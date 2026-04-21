
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, Brain, Bot, Settings, ShieldCheck, Database } from 'lucide-react';
import { wazuhService } from '../../services/wazuhService';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isWazuhConnected, setIsWazuhConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;

    const checkConnection = async () => {
      try {
        await wazuhService.isConnected();
        if (alive) setIsWazuhConnected(true);
      } catch {
        if (alive) setIsWazuhConnected(false);
      }
    };

    void checkConnection();
    const interval = window.setInterval(() => {
      void checkConnection();
    }, 30000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Bell size={20} />, label: 'Alerts', path: '/alerts' },
    { icon: <Brain size={20} />, label: 'Alert Classification', path: '/ml-classification' },
    { icon: <Bot size={20} />, label: 'LLM Summaries', path: '/llm-summaries', badge: 'New' },
    { icon: <Database size={20} />, label: 'IOC Extraction', path: '/ioc-extraction' },
    { icon: <ShieldCheck size={20} />, label: 'Wazuh Logs', path: '/wazuh-logs' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <ShieldCheck className="w-6 h-6 text-cyan-500 mr-3" />
        <h1 className="text-lg font-bold tracking-wide text-slate-100">
          SECOPS <span className="text-cyan-500">AI</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all group ${isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
                }`}
            >
              <span className={`${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="ml-3 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-violet-600/20 text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Settings at bottom of list but visually separate */}
        <div className="pt-4 mt-4 border-t border-slate-800/50">
          <Link
            to="/settings"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${location.pathname === '/settings'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <Settings size={20} className={location.pathname === '/settings' ? 'text-cyan-400' : 'text-slate-500'} />
            <span className="ml-3 text-sm font-medium">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300">Wazuh Manager</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isWazuhConnected === false ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isWazuhConnected === false ? 'text-red-400' : 'text-emerald-500'}`}>
              {isWazuhConnected === false ? 'Disconnected' : isWazuhConnected === true ? 'Connected' : 'Checking...'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

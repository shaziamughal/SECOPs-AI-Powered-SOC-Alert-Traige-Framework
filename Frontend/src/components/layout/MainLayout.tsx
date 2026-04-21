import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSettings } from '../../context/SettingsContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30 app-shell">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />
        <main className={`flex-1 overflow-y-auto app-main ${settings.density === 'compact' ? 'p-4' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

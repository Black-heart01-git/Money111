
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab, isDark, toggleTheme }) => {
  if (!user) return <>{children}</>;

  const tabs = [
    { id: 'games', icon: '🎮', label: 'Games' },
    { id: 'wallet', icon: '₦', label: 'Wallet' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className={`flex flex-col min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 flex">
            <div className="bg-naija-green w-1/3 h-full"></div>
            <div className="bg-white w-1/3 h-full"></div>
            <div className="bg-naija-green w-1/3 h-full border-y border-gray-100"></div>
          </div>
          <span className="font-brand font-black text-xl tracking-tighter text-naija-green">MONEY11</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            title="Toggle Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t flex justify-around items-center py-2 px-4 shadow-lg z-50 transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id ? 'text-naija-green' : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

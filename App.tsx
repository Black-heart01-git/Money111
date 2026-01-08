
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import GameSelection from './views/GameSelection';
import Wallet from './views/Wallet';
import Layout from './components/Layout';
import AdminPanel from './views/AdminPanel';
import { User, Transaction } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('games');
  const [isDark, setIsDark] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: new Date().toISOString(), method: 'Paystack' },
    { id: '2', type: 'game_win', amount: 1200, status: 'completed', date: new Date().toISOString(), method: 'Ludo' },
  ]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = (data: any, isGuest = false) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      fullName: data.fullName || 'New User',
      phoneNumber: data.phoneNumber || '08000000000',
      email: data.email || 'guest@money11.com',
      balance: isGuest ? 0 : 5000,
      tier: 'Starter',
      referralCode: 'M11' + Math.floor(1000 + Math.random() * 9000),
      isGuest
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('games');
  };

  const renderContent = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (activeTab) {
      case 'games':
        return <GameSelection user={user} isDark={isDark} onSelect={(id) => console.log('Selected game:', id)} />;
      case 'wallet':
        return <Wallet user={user} isDark={isDark} transactions={transactions} onAction={(type) => console.log('Wallet action:', type)} />;
      case 'stats':
        return (
          <div className="p-4 space-y-6">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Your Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Games Played</p>
                <h3 className="text-3xl font-black mt-1">42</h3>
              </div>
              <div className={`p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Win Rate</p>
                <h3 className="text-3xl font-black mt-1 text-naija-green">68%</h3>
              </div>
            </div>
            <div className={`p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Earnings History</p>
              <div className="h-40 w-full flex items-end gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-naija-green rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group" style={{height: `${h}%`}}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold hidden group-hover:block">₦{h*10}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-4 space-y-6">
            <div className={`flex items-center gap-4 p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-16 h-16 rounded-2xl bg-naija-green flex items-center justify-center text-3xl shadow-lg shadow-green-500/20">👤</div>
              <div>
                <h3 className="text-xl font-black">{user.fullName}</h3>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.tier} Account</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Security & PIN', desc: 'Secure your withdrawals' },
                { label: 'Responsible Gaming', desc: 'Set limits and exclusions' },
                { label: 'Support Center', desc: 'Talk to our team' }
              ].map((item) => (
                <button key={item.label} className={`w-full p-5 rounded-2xl text-left shadow-sm border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                  <p className="font-black text-sm">{item.label}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{item.desc}</p>
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full bg-red-500/10 text-red-500 p-5 rounded-2xl text-center font-black mt-4 transition-colors uppercase tracking-widest text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return <GameSelection user={user} isDark={isDark} onSelect={() => {}} />;
    }
  };

  const isAdminPath = window.location.hash === '#/admin';
  if (isAdminPath) return <AdminPanel />;

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

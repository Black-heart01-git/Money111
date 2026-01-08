
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
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: new Date().toISOString(), method: 'Paystack' },
    { id: '2', type: 'game_win', amount: 1200, status: 'completed', date: new Date().toISOString(), method: 'Ludo' },
  ]);

  const handleLogin = (phone: string, isGuest = false) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      phoneNumber: phone,
      balance: isGuest ? 0 : 2500,
      tier: 1,
      referralCode: 'MONEY' + Math.floor(1000 + Math.random() * 9000),
      isGuest
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('games');
  };

  // Simple Router based on activeTab and User state
  const renderContent = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (activeTab) {
      case 'games':
        return <GameSelection onSelect={(id) => console.log('Selected game:', id)} />;
      case 'wallet':
        return <Wallet user={user} transactions={transactions} onAction={(type) => console.log('Wallet action:', type)} />;
      case 'stats':
        return (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-black text-gray-800">Your Game Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Games Played</p>
                <h3 className="text-3xl font-black mt-1">42</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Win Rate</p>
                <h3 className="text-3xl font-black mt-1 text-naija-green">68%</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Earnings over time</p>
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
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{user.phoneNumber}</h3>
                <p className="text-sm text-gray-400">Tier {user.tier} Account</p>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-gray-700 shadow-sm flex justify-between items-center">
                <span>Verification Settings</span>
                <span className="text-xs text-amber-500 font-bold uppercase">Upgrade to Tier 2</span>
              </button>
              <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-gray-700 shadow-sm">Security & PIN</button>
              <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-gray-700 shadow-sm">Responsible Gaming</button>
              <button className="w-full bg-white p-4 rounded-xl text-left font-bold text-gray-700 shadow-sm">Support Center</button>
              <button 
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 p-4 rounded-xl text-center font-black mt-4 shadow-sm active:bg-red-100 transition-colors uppercase tracking-widest"
              >
                Log Out
              </button>
            </div>
          </div>
        );
      default:
        return <GameSelection onSelect={() => {}} />;
    }
  };

  // Check for admin path in hash
  const isAdminPath = window.location.hash === '#/admin';
  if (isAdminPath) return <AdminPanel />;

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import GameSelection from './views/GameSelection';
import Wallet from './views/Wallet';
import Layout from './components/Layout';
import AdminPanel from './views/AdminPanel';
import GameContainer from './components/GameContainer';
import { User, Transaction } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('games');
  const [isDark, setIsDark] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: new Date().toISOString(), method: 'Paystack' },
    { id: '2', type: 'game_win', amount: 1000, status: 'completed', date: new Date().toISOString(), method: 'Ludo' },
  ]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = (data: any, isGuest = false) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      fullName: data.fullName || 'Guest User',
      phoneNumber: data.phoneNumber || '08000000000',
      email: data.email || 'guest@money11.com',
      balance: isGuest ? 0 : 15000, // Enough for high stakes initially
      tier: 'Starter',
      referralCode: 'M11' + Math.floor(1000 + Math.random() * 9000),
      isGuest
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('games');
    setSelectedGameId(null);
  };

  const handleWin = (amount: number) => {
    if (user) {
      const winnings = amount; // Double the stake (stake returned + stake won)
      setUser({ ...user, balance: user.balance + winnings });
      const newTx: Transaction = {
        id: Math.random().toString(),
        type: 'game_win',
        amount: winnings,
        status: 'completed',
        date: new Date().toISOString(),
        method: selectedGameId || 'Game'
      };
      setTransactions([newTx, ...transactions]);
    }
  };

  const handleLose = (amount: number) => {
    if (user) {
      setUser({ ...user, balance: user.balance - amount });
      const newTx: Transaction = {
        id: Math.random().toString(),
        type: 'game_entry',
        amount,
        status: 'completed',
        date: new Date().toISOString(),
        method: selectedGameId || 'Game'
      };
      setTransactions([newTx, ...transactions]);
    }
  };

  const renderContent = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (activeTab) {
      case 'games':
        return <GameSelection user={user} isDark={isDark} onSelect={(id) => setSelectedGameId(id)} />;
      case 'wallet':
        return <Wallet user={user} isDark={isDark} transactions={transactions} onAction={(type) => console.log('Wallet action:', type)} />;
      case 'stats':
        return (
          <div className="p-4 space-y-6">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Your Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Games Played</p>
                <h3 className="text-3xl font-black mt-1">{transactions.filter(t => t.type.includes('game')).length}</h3>
              </div>
              <div className={`p-6 rounded-3xl shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Earnings</p>
                <h3 className="text-3xl font-black mt-1 text-naija-green">₦{transactions.filter(t => t.type === 'game_win').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</h3>
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
              <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 p-5 rounded-2xl text-center font-black mt-4 uppercase tracking-widest text-sm">Sign Out</button>
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
      {selectedGameId && user && (
        <GameContainer 
          gameId={selectedGameId} 
          user={user} 
          isDark={isDark} 
          onClose={() => setSelectedGameId(null)}
          onWin={handleWin}
          onLose={handleLose}
        />
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;


import React, { useState } from 'react';
import { Transaction, User, AccountTier } from '../types';
import { TIER_CONFIG } from '../constants';

interface WalletProps {
  user: User;
  transactions: Transaction[];
  onAction: (type: 'deposit' | 'withdraw') => void;
  isDark: boolean;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onAction, isDark }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'upgrade'>('deposit');

  return (
    <div className="p-4 space-y-6 pb-12">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl p-6 shadow-sm border transition-colors`}>
        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Total Balance</p>
        <h2 className="text-4xl font-black mt-2 tracking-tighter">₦{user.balance.toLocaleString()}</h2>
        <div className="mt-4 flex gap-2">
          <span className="px-2 py-1 bg-naija-green/10 text-naija-green rounded text-[10px] font-bold uppercase">{user.tier} Tier</span>
          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold uppercase">Daily Limit: ₦{TIER_CONFIG[user.tier].dailyLimit.toLocaleString()}</span>
        </div>
      </div>

      <div className={`flex p-1 shadow-sm border rounded-2xl transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        {(['deposit', 'withdraw', 'upgrade'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all capitalize text-sm ${
              activeTab === tab 
                ? 'bg-naija-green text-white shadow-lg' 
                : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'upgrade' ? (
        <div className="space-y-4">
          <h3 className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Upgrade Your Experience</h3>
          {(['Starter', 'Premium', 'Pro'] as AccountTier[]).map((tier) => (
            <div 
              key={tier}
              className={`p-6 rounded-3xl border transition-all ${
                user.tier === tier 
                  ? 'border-naija-green bg-naija-green/5' 
                  : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-xl">{tier}</h4>
                  <p className="text-xs text-gray-500 font-medium">Daily Withdrawal: ₦{TIER_CONFIG[tier].dailyLimit.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-naija-green">₦{TIER_CONFIG[tier].price.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">One-time fee</p>
                </div>
              </div>
              <button 
                disabled={user.tier === tier}
                className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
                  user.tier === tier 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {user.tier === tier ? 'Current Plan' : `Upgrade to ${tier}`}
              </button>
            </div>
          ))}
        </div>
      ) : activeTab === 'deposit' ? (
        <div className={`rounded-3xl p-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="space-y-3">
            {[
              { id: 'paystack', name: 'Paystack (Cards/Bank)', icon: '💳' },
              { id: 'flutterwave', name: 'Flutterwave', icon: '🌊' },
              { id: 'ussd', name: 'USSD (*966#)', icon: '📱' },
              { id: 'airtime', name: 'Airtime Deposit', icon: '📶' },
            ].map(method => (
              <button key={method.id} onClick={() => onAction('deposit')} className={`w-full flex items-center p-4 border rounded-2xl transition-all text-left ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-green-50'}`}>
                <span className="text-2xl mr-4">{method.icon}</span>
                <span className="font-bold text-gray-600">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`rounded-3xl p-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="space-y-3">
            {[
              { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
              { id: 'airtime_out', name: 'Airtime Payout', icon: '📱' },
              { id: 'data', name: 'Data Bundles', icon: '📡' },
            ].map(method => (
              <button key={method.id} onClick={() => onAction('withdraw')} className={`w-full flex items-center p-4 border rounded-2xl transition-all text-left ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-green-50'}`}>
                <span className="text-2xl mr-4">{method.icon}</span>
                <span className="font-bold text-gray-600">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mt-8">
        <h3 className={`font-black text-sm uppercase tracking-widest px-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transaction History</h3>
        {transactions.length > 0 ? (
          transactions.map(tx => (
            <div key={tx.id} className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type.includes('win') || tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {tx.type === 'deposit' ? '↓' : tx.type === 'withdrawal' ? '↑' : '🎮'}
                </div>
                <div>
                  <p className="font-bold text-sm capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${tx.type.includes('win') || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type.includes('win') || tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{tx.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-30">
            <p className="text-4xl mb-2">💸</p>
            <p className="text-sm font-bold uppercase tracking-widest">No Activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

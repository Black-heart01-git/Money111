
import React, { useState } from 'react';
import { Transaction, User } from '../types';
import { WITHDRAWAL_LIMITS } from '../constants';

interface WalletProps {
  user: User;
  transactions: Transaction[];
  onAction: (type: 'deposit' | 'withdraw') => void;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onAction }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-gray-400 text-sm font-medium">Available Balance</p>
          <h2 className="text-5xl font-black mt-2 tracking-tighter">₦{user.balance.toLocaleString()}</h2>
          <p className="text-naija-green text-xs mt-2 font-bold uppercase tracking-widest">Verified Account</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-naija-green blur-[80px] opacity-20"></div>
      </div>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'deposit' ? 'bg-naija-green text-white shadow-lg' : 'text-gray-500'}`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'withdraw' ? 'bg-naija-green text-white shadow-lg' : 'text-gray-500'}`}
        >
          Withdraw
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span>{activeTab === 'deposit' ? 'Select Payment Method' : 'Withdrawal Options'}</span>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">No KYC Required</span>
        </h3>

        {activeTab === 'deposit' ? (
          <div className="space-y-3">
            {[
              { id: 'paystack', name: 'Paystack (Cards/Bank)', icon: '💳' },
              { id: 'flutterwave', name: 'Flutterwave', icon: '🌊' },
              { id: 'ussd', name: 'USSD (*966#)', icon: '📱' },
              { id: 'airtime', name: 'Airtime Deposit', icon: '📶' },
            ].map(method => (
              <button key={method.id} onClick={() => onAction('deposit')} className="w-full flex items-center p-4 border rounded-xl hover:border-naija-green hover:bg-green-50 transition-all text-left">
                <span className="text-2xl mr-4">{method.icon}</span>
                <span className="font-semibold text-gray-700">{method.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { id: 'bank', name: 'Bank Transfer (Min ₦500)', icon: '🏦' },
              { id: 'airtime_out', name: 'Airtime Payout', icon: '📱' },
              { id: 'data', name: 'Data Bundles', icon: '📡' },
            ].map(method => (
              <button key={method.id} onClick={() => onAction('withdraw')} className="w-full flex items-center p-4 border rounded-xl hover:border-naija-green hover:bg-green-50 transition-all text-left">
                <span className="text-2xl mr-4">{method.icon}</span>
                <span className="font-semibold text-gray-700">{method.name}</span>
              </button>
            ))}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 space-y-1">
              {/* Fix: Specifically access 'tier1' or 'tier2' properties to avoid union type ambiguity with minWithdrawal number property */}
              <p>Daily Limit: ₦{(WITHDRAWAL_LIMITS[`tier${user.tier}` as 'tier1' | 'tier2']).daily.toLocaleString()}</p>
              <p>Processing: Instant (Airtime) | 2-24h (Bank)</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 px-1">Recent Transactions</h3>
        {transactions.length > 0 ? (
          transactions.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type.includes('win') || tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'deposit' ? '↓' : tx.type === 'withdrawal' ? '↑' : '🎮'}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${tx.type.includes('win') || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type.includes('win') || tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </p>
                <p className={`text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'text-green-400' : 'text-amber-400'}`}>{tx.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">💸</p>
            <p className="text-sm font-medium">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

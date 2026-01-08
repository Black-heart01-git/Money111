
import React from 'react';
import { GAMES } from '../constants';
import { User } from '../types';

interface GameSelectionProps {
  user: User;
  onSelect: (gameId: string) => void;
  isDark: boolean;
}

const GameSelection: React.FC<GameSelectionProps> = ({ user, onSelect, isDark }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-naija-green rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-xs font-bold uppercase tracking-widest">Active Player</p>
              <h2 className="text-2xl font-black mt-1">Hello, {user.fullName || 'Guest'}! 🇳🇬</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/20">
              {user.tier} Account
            </div>
          </div>
          
          <div className="mt-8 flex flex-col">
            <p className="text-green-100 text-xs font-medium opacity-80 uppercase tracking-tighter">Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">₦{user.balance.toLocaleString()}</span>
              <span className="text-green-300 text-xs font-bold">Available</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button className="bg-white text-naija-green px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-black/10">QUICK DEPOSIT</button>
            <button className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xs font-bold">WITHDRAW</button>
          </div>
        </div>
        <div className="absolute right-[-10%] bottom-[-20%] text-[160px] font-black opacity-10 rotate-12 select-none">₦</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className={`flex flex-col text-left p-4 rounded-3xl shadow-sm border transition-all active:scale-95 group ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl ${game.color} flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform`}>
              {game.icon}
            </div>
            <h3 className={`font-bold leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{game.name}</h3>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">Entry: ₦{game.minEntry}</p>
          </button>
        ))}
      </div>

      <div className={`${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-3xl p-5 flex items-center gap-4`}>
        <div className="text-4xl">🎁</div>
        <div className="flex-1">
          <h4 className={`font-bold text-sm ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>Referral Bonus</h4>
          <p className={`text-xs ${isDark ? 'text-amber-500/80' : 'text-amber-600'}`}>Invite friends and earn up to ₦200 per sign up.</p>
        </div>
        <button className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20">SHARE</button>
      </div>
    </div>
  );
};

export default GameSelection;

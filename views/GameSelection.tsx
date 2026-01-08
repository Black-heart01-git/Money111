
import React from 'react';
import { GAMES } from '../constants';

interface GameSelectionProps {
  onSelect: (gameId: string) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ onSelect }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-naija-green rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Welcome back, Winner! 🇳🇬</h2>
          <p className="text-green-100 text-sm mt-1">Ready to multiply your Naira today?</p>
          <div className="mt-4 flex gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold">DAILY BONUS: AVAILABLE</div>
          </div>
        </div>
        <div className="absolute right-[-10%] bottom-[-10%] text-9xl opacity-10">₦</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className="flex flex-col text-left bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform`}>
              {game.icon}
            </div>
            <h3 className="font-bold text-gray-900 leading-tight">{game.name}</h3>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Entry from ₦{game.minEntry}</p>
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
        <div className="text-3xl">🎁</div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-800 text-sm">Refer a Friend & Earn ₦200</h4>
          <p className="text-amber-600 text-xs">They get ₦100 on registration!</p>
        </div>
        <button className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold">INVITE</button>
      </div>
    </div>
  );
};

export default GameSelection;

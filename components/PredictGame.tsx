
import React, { useState } from 'react';

const PredictGame: React.FC<{ onWin: () => void; onLose: () => void; isDark: boolean }> = ({ onWin, onLose, isDark }) => {
  const [betPlaced, setBetPlaced] = useState(false);
  const matches = [
    { home: 'Arsenal', away: 'Chelsea', time: '16:00', odds: [1.8, 3.2, 4.5] },
    { home: 'Man City', away: 'Liverpool', time: '18:30', odds: [2.1, 3.0, 3.8] },
  ];

  const handlePredict = () => {
    setBetPlaced(true);
    setTimeout(() => {
       if (Math.random() > 0.5) onWin();
       else onLose();
    }, 2000);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl">
        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Premier League Day</h3>
        <p className="text-xs font-bold opacity-70">Predict outcomes and win big!</p>
      </div>

      <div className="space-y-4">
        {matches.map((m, i) => (
          <div key={i} className={`p-6 rounded-[35px] border-4 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="text-center w-24">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-2 flex items-center justify-center text-xl">⚽</div>
                <p className="font-black text-sm">{m.home}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-naija-green bg-green-50 px-2 py-0.5 rounded-full mb-1">LIVE</p>
                <p className="text-2xl font-black">VS</p>
              </div>
              <div className="text-center w-24">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-2 flex items-center justify-center text-xl">🛡️</div>
                <p className="font-black text-sm">{m.away}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {m.odds.map((odd, j) => (
                <button key={j} onClick={handlePredict} disabled={betPlaced} className="bg-gray-50 dark:bg-gray-700 py-3 rounded-2xl border-2 border-transparent hover:border-naija-green transition-all group">
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-naija-green">{j === 0 ? 'HOME' : j === 1 ? 'DRAW' : 'AWAY'}</p>
                  <p className="text-lg font-black">{odd}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {betPlaced && <div className="text-center animate-pulse py-8 font-black text-naija-green">SUBMITTING PREDICTION...</div>}
    </div>
  );
};

export default PredictGame;

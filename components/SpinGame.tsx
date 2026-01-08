
import React, { useState } from 'react';

const PRIZES = ["₦500", "Better Luck", "₦2,000", "₦100", "Jackpot!", "₦50", "Try Again", "₦1,000"];
const COLORS = ["#008751", "#ff4d4d", "#ffd700", "#4d79ff", "#9333ea", "#008751", "#6b7280", "#ffd700"];

const SpinGame: React.FC<{ onWin: (amount: number) => void }> = ({ onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const extra = 1800 + Math.random() * 1800;
    const finalRot = rotation + extra;
    setRotation(finalRot);

    setTimeout(() => {
      setSpinning(false);
      const actualRot = finalRot % 360;
      const idx = Math.floor((360 - actualRot + 22.5) / 45) % 8;
      const prize = PRIZES[idx];
      if (prize.includes('₦')) {
        onWin(parseInt(prize.replace('₦', '').replace(',', '')));
      } else if (prize === 'Jackpot!') {
        onWin(10000);
      }
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-12">
      <div className="relative">
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-8 h-12 bg-red-600 z-50 rounded-b-full shadow-lg border-x-4 border-white"></div>
        <div className="w-72 h-72 rounded-full border-[10px] border-white shadow-2xl overflow-hidden relative transition-transform duration-[5000ms] ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
          {PRIZES.map((p, i) => (
            <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 45}deg)`, clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 20%)' }}>
               <div className="absolute inset-0 flex items-start justify-center pt-8" style={{ backgroundColor: COLORS[i] }}>
                 <span className="text-white font-black text-[10px] uppercase rotate-[100deg]">{p}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={spin} disabled={spinning} className={`px-16 py-6 rounded-full font-black text-2xl shadow-2xl transition-all ${spinning ? 'bg-gray-400 opacity-50' : 'bg-naija-green text-white hover:scale-105 active:scale-95'}`}>
        {spinning ? 'SPINNING...' : 'SPIN FOR FREE'}
      </button>
    </div>
  );
};

export default SpinGame;


import React, { useState, useEffect, useRef } from 'react';

const ROWS = 8;
const PEGS: {x: number, y: number}[] = [];
for (let r = 2; r < ROWS; r++) {
  for (let i = 0; i <= r; i++) {
    PEGS.push({ x: (i - r / 2) * 40 + 200, y: r * 50 + 50 });
  }
}

interface PlinkoGameProps { onWin: () => void; onLose: () => void; }

const PlinkoGame: React.FC<PlinkoGameProps> = ({ onWin, onLose }) => {
  const [balls, setBalls] = useState<{id: number, x: number, y: number, vx: number, vy: number}[]>([]);
  const [dropsLeft, setDropsLeft] = useState(3);
  const [totalWin, setTotalWin] = useState(0);
  const requestRef = useRef<number>(null);

  const update = () => {
    setBalls(prev => prev.map(b => {
      let nx = b.x + b.vx;
      let ny = b.y + b.vy;
      let nvx = b.vx;
      let nvy = b.vy + 0.3; // Gravity

      PEGS.forEach(p => {
        const dx = nx - p.x;
        const dy = ny - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 10) {
          const angle = Math.atan2(dy, dx);
          nvx = Math.cos(angle) * 3;
          nvy = Math.abs(Math.sin(angle)) * 3;
        }
      });

      return { ...b, x: nx, y: ny, vx: nvx, vy: nvy };
    }).filter(b => {
      if (b.y > 450) {
        const slot = Math.floor(b.x / 80);
        if (slot === 2) setTotalWin(prev => prev + 1000);
        return false;
      }
      return true;
    }));
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const dropBall = () => {
    if (dropsLeft <= 0) return;
    setBalls([...balls, { id: Date.now(), x: 200 + (Math.random()-0.5)*10, y: 20, vx: 0, vy: 0 }]);
    setDropsLeft(prev => prev - 1);
  };

  useEffect(() => {
    if (dropsLeft === 0 && balls.length === 0) {
      setTimeout(() => {
        if (totalWin > 500) onWin(); else onLose();
      }, 2000);
    }
  }, [dropsLeft, balls]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-[400px] h-[500px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden">
        {PEGS.map((p, i) => <div key={i} className="absolute w-2 h-2 bg-white rounded-full opacity-50 shadow-[0_0_10px_white]" style={{ left: p.x, top: p.y }}></div>)}
        {balls.map(b => <div key={b.id} className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" style={{ left: b.x-8, top: b.y-8 }}></div>)}
        
        <div className="absolute bottom-0 w-full flex justify-around p-2 bg-black/40">
           {['X0', 'X0.5', 'X2', 'X0.5', 'X0'].map((m, i) => (
             <div key={i} className={`w-14 h-12 flex items-center justify-center font-black text-xs rounded-lg border-2 ${m === 'X2' ? 'border-naija-green bg-naija-green/20' : 'border-white/10'}`}>
               {m}
             </div>
           ))}
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-4">
        <p className="text-2xl font-black text-naija-green">₦{totalWin.toLocaleString()}</p>
        <button onClick={dropBall} disabled={dropsLeft <= 0} className="bg-naija-green text-white px-12 py-5 rounded-[30px] font-black text-xl shadow-xl active:scale-95 transition-all">
          DROP BALL ({dropsLeft})
        </button>
      </div>
    </div>
  );
};

export default PlinkoGame;

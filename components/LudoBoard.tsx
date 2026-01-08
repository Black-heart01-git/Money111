
import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Piece {
  id: string;
  color: 'red' | 'blue' | 'yellow' | 'green';
  pos: number; // -1: base, 0-51: main track, 52-57: home stretch, 58: finished
  index: number;
}

interface LudoBoardProps {
  onWin: () => void;
  onLose: () => void;
  isDark: boolean;
}

// 15x15 grid coordinate mapping
const TRACK_COORDS: { x: number; y: number }[] = [
  { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, // 0-4
  { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 }, // 5-10
  { x: 0, y: 7 }, { x: 0, y: 8 }, // 11-12
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, // 13-17
  { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 }, // 18-23
  { x: 7, y: 14 }, { x: 8, y: 14 }, // 24-25
  { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 }, // 26-30
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 }, // 31-36
  { x: 14, y: 7 }, { x: 14, y: 6 }, // 37-38
  { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }, // 39-43
  { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, { x: 8, y: 0 }, // 44-49
  { x: 7, y: 0 }, { x: 6, y: 0 } // 50-51
];

const HOME_STRETCH: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }],
  blue: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }],
  yellow: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }],
  green: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }]
};

const BASE_STARTS: Record<string, number> = {
  red: 0,
  blue: 13,
  yellow: 26,
  green: 39
};

const LudoBoard: React.FC<LudoBoardProps> = ({ onWin, onLose, isDark }) => {
  const COLORS = {
    blue: { main: '#0284c7', light: '#bae6fd', bg: 'bg-sky-500' },
    red: { main: '#e11d48', light: '#fecdd3', bg: 'bg-rose-500' },
    green: { main: '#10b981', light: '#a7f3d0', bg: 'bg-emerald-500' },
    yellow: { main: '#f59e0b', light: '#fde68a', bg: 'bg-amber-400' },
  };

  const initialPieces = (): Piece[] => {
    const p: Piece[] = [];
    (['blue', 'red', 'green', 'yellow'] as const).forEach(color => {
      for (let i = 0; i < 4; i++) {
        p.push({ id: `${color}-${i}`, color, pos: -1, index: i });
      }
    });
    return p;
  };

  const [pieces, setPieces] = useState<Piece[]>(initialPieces());
  const [turn, setTurn] = useState<keyof typeof COLORS>('yellow');
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [usedDice, setUsedDice] = useState<[boolean, boolean]>([true, true]);
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("Your turn! Tap the center.");

  const rollDice = useCallback(() => {
    if (turn !== 'yellow' || isRolling || (!usedDice[0] || !usedDice[1])) return;
    setIsRolling(true);
    setMessage("Rolling...");
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);
      setUsedDice([false, false]);
      setIsRolling(false);
      setMessage("Select a number and tap a seed!");
    }, 600);
  }, [turn, isRolling, usedDice]);

  const rotateTurn = useCallback(() => {
    const order: (keyof typeof COLORS)[] = ['yellow', 'blue', 'red', 'green'];
    const nextIdx = (order.indexOf(turn) + 1) % 4;
    const nextTurn = order[nextIdx];
    setTurn(nextTurn);
    setUsedDice([true, true]);
    setSelectedDieIndex(null);
    if (nextTurn !== 'yellow') {
      simulateAi(nextTurn);
    } else {
      setMessage("Your turn!");
    }
  }, [turn]);

  const simulateAi = (color: keyof typeof COLORS) => {
    setMessage(`${color.toUpperCase()} thinking...`);
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);

      // Simple AI: tries to move first piece that can move
      setTimeout(() => {
        setPieces(prev => {
          let updated = [...prev];
          [r1, r2].forEach(val => {
            const movable = updated.find(p => p.color === color && canMove(p, val));
            if (movable) {
              updated = updated.map(p => p.id === movable.id ? executeMove(p, val) : p);
            }
          });
          return updated;
        });
        setTimeout(rotateTurn, 1000);
      }, 800);
    }, 800);
  };

  const canMove = (piece: Piece, steps: number) => {
    if (piece.pos === -1) return steps === 6;
    if (piece.pos === 58) return false;
    if (piece.pos >= 52) return piece.pos + steps <= 58;
    return true;
  };

  const executeMove = (p: Piece, steps: number): Piece => {
    let newPos = p.pos;
    if (p.pos === -1) newPos = BASE_STARTS[p.color];
    else if (p.pos < 52) {
      const start = BASE_STARTS[p.color];
      const endThreshold = (start + 50) % 52;
      // Home stretch entry logic
      // This is simplified for the demo board
      if (p.pos === endThreshold) newPos = 52;
      else newPos = (p.pos + steps) % 52;
    } else {
      newPos += steps;
    }
    return { ...p, pos: newPos };
  };

  const handlePieceClick = (piece: Piece) => {
    if (turn !== 'yellow' || selectedDieIndex === null || usedDice[selectedDieIndex]) return;
    if (piece.color !== 'yellow') return;

    const steps = dice[selectedDieIndex];
    if (canMove(piece, steps)) {
      setPieces(prev => prev.map(p => p.id === piece.id ? executeMove(p, steps) : p));
      const newUsed = [...usedDice] as [boolean, boolean];
      newUsed[selectedDieIndex] = true;
      setUsedDice(newUsed);
      setSelectedDieIndex(null);

      if (newUsed[0] && newUsed[1]) {
        if (dice[0] !== 6 && dice[1] !== 6) {
          setTimeout(rotateTurn, 1000);
        } else {
          setMessage("You got a 6! Roll again.");
          setUsedDice([true, true]);
        }
      }
    } else {
      setMessage("Can't move this one!");
    }
  };

  const getVisualCoords = (p: Piece) => {
    if (p.pos === -1) {
      const bases = {
        red: { x: 10, y: 1 },
        blue: { x: 1, y: 1 },
        yellow: { x: 1, y: 10 },
        green: { x: 10, y: 10 }
      };
      const b = bases[p.color];
      const offset = [[0,0], [2,0], [0,2], [2,2]][p.index];
      return { x: b.x + offset[0] + 0.5, y: b.y + offset[1] + 0.5 };
    }
    if (p.pos === 58) return { x: 7.5, y: 7.5 };
    if (p.pos >= 52) return { x: HOME_STRETCH[p.color][p.pos - 52].x + 0.5, y: HOME_STRETCH[p.color][p.pos - 52].y + 0.5 };
    return { x: TRACK_COORDS[p.pos].x + 0.5, y: TRACK_COORDS[p.pos].y + 0.5 };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-lg mx-auto p-4 select-none">
      <div className={`mb-4 px-6 py-3 rounded-full font-black text-sm shadow-xl transition-all ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b-4 border-naija-green`}>
        {message}
      </div>

      <div className={`relative w-full aspect-square border-8 rounded-[40px] shadow-2xl p-1 overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        {/* Background Grid Layer */}
        <div className="absolute inset-0 grid grid-cols-15 grid-rows-15 opacity-10">
          {Array.from({ length: 225 }).map((_, i) => (
            <div key={i} className="border border-gray-500" />
          ))}
        </div>

        {/* Color Bases */}
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-sky-500 rounded-br-[60px] p-4 flex flex-wrap gap-4 items-center justify-center">
          <div className="w-full h-full bg-white/20 rounded-[40px] border-4 border-dashed border-white/40 flex items-center justify-center text-4xl opacity-50">✈️</div>
        </div>
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-rose-500 rounded-bl-[60px] p-4 flex flex-wrap gap-4 items-center justify-center">
          <div className="w-full h-full bg-white/20 rounded-[40px] border-4 border-dashed border-white/40 flex items-center justify-center text-4xl opacity-50">🚀</div>
        </div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-amber-400 rounded-tr-[60px] p-4 flex flex-wrap gap-4 items-center justify-center">
          <div className="w-full h-full bg-white/20 rounded-[40px] border-4 border-dashed border-white/40 flex items-center justify-center text-4xl opacity-50">⚡</div>
        </div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-500 rounded-tl-[60px] p-4 flex flex-wrap gap-4 items-center justify-center">
          <div className="w-full h-full bg-white/20 rounded-[40px] border-4 border-dashed border-white/40 flex items-center justify-center text-4xl opacity-50">🍀</div>
        </div>

        {/* Home Paths */}
        {/* Vertical Center */}
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-10 bg-white shadow-2xl rounded-2xl flex items-center justify-center border-4 border-gray-100 overflow-hidden">
            <div className="grid grid-cols-2 gap-1 p-2">
                {[0, 1].map(idx => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDieIndex(idx)}
                        disabled={usedDice[idx] || turn !== 'yellow'}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all shadow-md font-bold ${isRolling ? 'animate-spin' : ''} ${selectedDieIndex === idx ? 'ring-4 ring-naija-green scale-110 z-20' : ''} ${usedDice[idx] ? 'bg-gray-100 text-gray-300' : 'bg-white text-gray-900 border-2 border-gray-100'}`}
                    >
                        {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[idx]-1]}
                    </button>
                ))}
            </div>
            {turn === 'yellow' && usedDice[0] && usedDice[1] && (
                <button 
                  onClick={rollDice}
                  className="absolute inset-0 bg-naija-green/90 text-white font-black text-xs uppercase animate-pulse flex items-center justify-center"
                >
                  ROLL
                </button>
            )}
        </div>

        {/* Render Track Squares manually for color */}
        {TRACK_COORDS.map((c, i) => (
          <div 
            key={i} 
            className="absolute w-[6.66%] h-[6.66%] border border-gray-100/20"
            style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}
          >
            {/* Safe zone stars */}
            {(i === 0 || i === 8 || i === 13 || i === 21 || i === 26 || i === 34 || i === 39 || i === 47) && (
              <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20">⭐</div>
            )}
          </div>
        ))}

        {/* Pieces Layer */}
        {pieces.map(p => {
          const coords = getVisualCoords(p);
          const isUserPiece = p.color === 'yellow';
          const isTurn = turn === 'yellow';
          const canInteract = isUserPiece && isTurn && selectedDieIndex !== null && !usedDice[selectedDieIndex];
          
          return (
            <div
              key={p.id}
              onClick={() => handlePieceClick(p)}
              className={`absolute w-[6%] h-[6%] rounded-full shadow-2xl border-4 border-white transition-all duration-500 ease-out cursor-pointer z-30 flex items-center justify-center ${canInteract ? 'animate-bounce ring-4 ring-white ring-offset-2' : ''}`}
              style={{
                left: `${coords.x * 6.66}%`,
                top: `${coords.y * 6.66}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: COLORS[p.color].main
              }}
            >
              <div className="w-1/2 h-1/2 rounded-full bg-white opacity-40" />
            </div>
          );
        })}
      </div>

      {/* Simplified Player Indicators */}
      <div className="w-full flex justify-between mt-8 px-4">
        {Object.entries(COLORS).map(([c, config]) => (
          <div key={c} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${turn === c ? 'scale-125' : 'opacity-40 grayscale'}`}>
            <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg mb-1`} style={{ backgroundColor: config.main }} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LudoBoard;

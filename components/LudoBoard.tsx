
import React, { useState, useEffect, useCallback } from 'react';

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

const LudoBoard: React.FC<LudoBoardProps> = ({ onWin, onLose, isDark }) => {
  const COLORS = {
    blue: { main: '#0284c7', light: '#bae6fd', startPos: 1, exitPos: 51 },
    red: { main: '#e11d48', light: '#fecdd3', startPos: 14, exitPos: 12 },
    green: { main: '#10b981', light: '#a7f3d0', startPos: 27, exitPos: 25 },
    yellow: { main: '#f59e0b', light: '#fde68a', startPos: 40, exitPos: 38 },
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
  const [dice, setDice] = useState<[number, number]>([6, 6]);
  const [isRolling, setIsRolling] = useState(false);
  const [usedDice, setUsedDice] = useState<[boolean, boolean]>([true, true]);
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("Tap the center to roll!");

  const rollDice = useCallback(() => {
    if (turn !== 'yellow' || isRolling || !usedDice[0] || !usedDice[1]) return;
    setIsRolling(true);
    setMessage("Rolling...");
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);
      setUsedDice([false, false]);
      setIsRolling(false);
      setMessage("Pick a die & tap a seed!");
    }, 600);
  }, [turn, isRolling, usedDice]);

  const handlePieceClick = (piece: Piece) => {
    if (turn !== 'yellow' || selectedDieIndex === null || usedDice[selectedDieIndex]) return;
    if (piece.color !== 'yellow') return;

    const steps = dice[selectedDieIndex];
    if (canMove(piece, steps)) {
      movePiece(piece.id, steps);
      const newUsed = [...usedDice] as [boolean, boolean];
      newUsed[selectedDieIndex] = true;
      setUsedDice(newUsed);
      setSelectedDieIndex(null);

      // Simple turn rotation logic
      if (newUsed[0] && newUsed[1]) {
        if (dice[0] !== 6 && dice[1] !== 6) {
          setTimeout(() => rotateTurn(), 1000);
        } else {
          setMessage("Bonus Roll! Roll again.");
          setUsedDice([true, true]);
        }
      }
    }
  };

  const canMove = (piece: Piece, steps: number) => {
    if (piece.pos === -1) return steps === 6;
    if (piece.pos === 58) return false;
    if (piece.pos >= 52) return piece.pos + steps <= 58;
    return true;
  };

  const movePiece = (id: string, steps: number) => {
    setPieces(prev => prev.map(p => {
      if (p.id !== id) return p;
      let newPos = p.pos;
      if (p.pos === -1) newPos = 0;
      else newPos += steps;
      return { ...p, pos: newPos };
    }));
  };

  const rotateTurn = () => {
    const order: Array<keyof typeof COLORS> = ['yellow', 'blue', 'red', 'green'];
    const next = order[(order.indexOf(turn) + 1) % 4];
    setTurn(next);
    setUsedDice([true, true]);
    if (next !== 'yellow') {
      simulateAi(next);
    } else {
      setMessage("Your Turn!");
    }
  };

  const simulateAi = (color: keyof typeof COLORS) => {
    setMessage(`${color.toUpperCase()} thinking...`);
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);
      // Primitive AI: Just move the first piece that can move
      setPieces(prev => {
        let updated = [...prev];
        const myPieces = updated.filter(p => p.color === color);
        // Move for r1
        const p1 = myPieces.find(p => canMove(p, r1));
        if (p1) {
          updated = updated.map(p => p.id === p1.id ? { ...p, pos: p.pos === -1 ? (r1 === 6 ? 0 : -1) : p.pos + r1 } : p);
        }
        // Move for r2
        const p2 = updated.filter(p => p.color === color).find(p => canMove(p, r2));
        if (p2) {
          updated = updated.map(p => p.id === p2.id ? { ...p, pos: p.pos === -1 ? (r2 === 6 ? 0 : -1) : p.pos + r2 } : p);
        }
        return updated;
      });
      setTimeout(() => rotateTurn(), 800);
    }, 800);
  };

  // Grid Rendering Logic
  const getCellType = (x: number, y: number) => {
    // 0-14 grid
    if (x < 6 && y < 6) return 'blue-base';
    if (x > 8 && y < 6) return 'red-base';
    if (x < 6 && y > 8) return 'yellow-base';
    if (x > 8 && y > 8) return 'green-base';
    if (x >= 6 && x <= 8 && y >= 6 && y <= 8) return 'center';
    
    // Paths
    if (x === 7 && y > 0 && y < 6) return 'red-home';
    if (x === 7 && y > 8 && y < 14) return 'yellow-home';
    if (y === 7 && x > 0 && x < 6) return 'blue-home';
    if (y === 7 && x > 8 && x < 14) return 'green-home';

    // Start Squares
    if (x === 1 && y === 6) return 'blue-start';
    if (x === 8 && y === 1) return 'red-start';
    if (x === 13 && y === 8) return 'green-start';
    if (x === 6 && y === 13) return 'yellow-start';

    // Safe stars
    if ((x === 2 && y === 6) || (x === 6 && y === 2) || (x === 12 && y === 8) || (x === 8 && y === 12)) return 'safe';

    return 'neutral';
  };

  const renderPiece = (piece: Piece, size: 'large' | 'small' = 'large') => {
    const isClickable = turn === 'yellow' && piece.color === 'yellow' && selectedDieIndex !== null && !usedDice[selectedDieIndex];
    return (
      <button
        key={piece.id}
        onClick={() => handlePieceClick(piece)}
        className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full shadow-lg border-2 border-white flex items-center justify-center transition-transform active:scale-95 ${isClickable ? 'ring-4 ring-white animate-pulse' : ''}`}
        style={{ backgroundColor: COLORS[piece.color].main }}
      >
        <div className="w-1/2 h-1/2 rounded-full bg-white opacity-40" />
      </button>
    );
  };

  const renderGrid = () => {
    const rows = [];
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const type = getCellType(x, y);
        let cellClass = "border border-gray-200 flex items-center justify-center relative ";
        
        if (type.includes('blue')) cellClass += "bg-sky-500/10 ";
        if (type.includes('red')) cellClass += "bg-rose-500/10 ";
        if (type.includes('yellow')) cellClass += "bg-amber-400/10 ";
        if (type.includes('green')) cellClass += "bg-emerald-500/10 ";
        
        if (type.includes('home') || type.includes('start')) {
            if (type.includes('blue')) cellClass = cellClass.replace('bg-sky-500/10', 'bg-sky-500');
            if (type.includes('red')) cellClass = cellClass.replace('bg-rose-500/10', 'bg-rose-500');
            if (type.includes('yellow')) cellClass = cellClass.replace('bg-amber-400/10', 'bg-amber-400');
            if (type.includes('green')) cellClass = cellClass.replace('bg-emerald-500/10', 'bg-emerald-500');
        }

        if (type === 'center') {
            // Draw triangles
            cellClass += "overflow-hidden ";
        }

        rows.push(
          <div key={`${x}-${y}`} className={cellClass}>
            {type === 'safe' && <span className="text-[10px] opacity-20">★</span>}
            
            {/* Base Pieces Rendering */}
            {['blue', 'red', 'yellow', 'green'].map(c => {
                const baseCoords = {
                    blue: [[1.5,1.5], [3.5,1.5], [1.5,3.5], [3.5,3.5]],
                    red: [[10.5,1.5], [12.5,1.5], [10.5,3.5], [12.5,3.5]],
                    yellow: [[1.5,10.5], [3.5,10.5], [1.5,13.5], [3.5,13.5]], // simplified mapping
                    green: [[10.5,10.5], [12.5,10.5], [10.5,13.5], [12.5,13.5]]
                }[c as keyof typeof COLORS];

                // Check if current x,y matches a base visual slot
                const isBaseSlot = baseCoords.some(([bx, by]) => Math.floor(bx) === x && Math.floor(by) === y);
                if (isBaseSlot) {
                    const slotIdx = baseCoords.findIndex(([bx, by]) => Math.floor(bx) === x && Math.floor(by) === y);
                    const p = pieces.find(p => p.color === c && p.index === slotIdx && p.pos === -1);
                    return p ? renderPiece(p) : <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 opacity-20" />;
                }
                return null;
            })}

            {/* Path Pieces (Conceptual) */}
            {/* Note: Standard Ludo tracking would map pos 0-51 to specific (x,y) coords. 
                For this toon version, we render pieces dynamically on top if pos >= 0. */}
          </div>
        );
      }
    }
    return rows;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-2 select-none">
      <div className={`px-4 py-2 rounded-2xl w-full text-center font-black text-sm shadow-inner transition-colors ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
        {message}
      </div>

      <div className={`relative w-full aspect-square border-8 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-15 grid-rows-15 p-1 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
        {renderGrid()}

        {/* The Dice Centerpiece */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center p-2 rounded-2xl bg-white shadow-xl border-4 border-gray-100 w-[20%] h-[20%]">
             <div className="flex gap-1 mb-1">
                {[0, 1].map(idx => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDieIndex(idx)}
                        disabled={usedDice[idx] || turn !== 'yellow'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl transition-all ${isRolling ? 'animate-spin' : ''} ${selectedDieIndex === idx ? 'ring-2 ring-naija-green scale-110 shadow-lg' : ''} ${usedDice[idx] ? 'bg-gray-100 text-gray-300' : 'bg-white text-gray-900 border'}`}
                    >
                        {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[idx]-1]}
                    </button>
                ))}
             </div>
             {turn === 'yellow' && usedDice[0] && usedDice[1] && (
                 <button 
                    onClick={rollDice}
                    className="bg-naija-green text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-md uppercase"
                 >
                     Roll
                 </button>
             )}
             <div className={`text-[8px] font-black uppercase mt-1 ${COLORS[turn].textClass || 'text-gray-400'}`}>
                {turn}
             </div>
        </div>

        {/* Render Path Pieces on absolute layer for smooth movement */}
        {/* For MVP, we render them based on a simplified track map logic */}
        {pieces.filter(p => p.pos >= 0 && p.pos < 58).map(p => {
            // Simplified positioning logic for demonstration
            // In a production app, we would have an array of 52 coordinates for the main track
            const isHome = p.pos >= 52;
            let left = '50%';
            let top = '50%';
            
            if (p.color === 'yellow') {
                if (isHome) {
                    left = `${7 * 6.66 + 3.33}%`;
                    top = `${(14 - (p.pos - 51)) * 6.66 + 3.33}%`;
                } else {
                    left = `${6 * 6.66 + 3.33}%`;
                    top = `${(14 - (p.pos % 6)) * 6.66 + 3.33}%`;
                }
            } else if (p.color === 'red') {
                if (isHome) {
                    left = `${(p.pos - 51) * 6.66 + 3.33}%`; // dummy
                    top = `${7 * 6.66 + 3.33}%`;
                }
            }
            // ... (Add other color mappings)

            return (
                <div 
                    key={p.id} 
                    className="absolute z-40 transition-all duration-500 ease-in-out pointer-events-none"
                    style={{ left, top, transform: 'translate(-50%, -50%)' }}
                >
                    {renderPiece(p)}
                </div>
            );
        })}
      </div>
      
      {/* Remove individual bottom status bars - integrated into center and board glow */}
    </div>
  );
};

export default LudoBoard;

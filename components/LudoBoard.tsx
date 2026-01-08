
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Piece {
  id: string;
  color: 'red' | 'blue' | 'yellow' | 'green';
  pos: number; // -1: base, 0-51: track, 52-57: home stretch, 58: home
  index: number;
}

interface LudoBoardProps {
  onWin: () => void;
  onLose: () => void;
  isDark: boolean;
}

// 15x15 Coordinate System
// Track starts at top-left-ish (6,1) and goes clockwise
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
  blue: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }],
  red: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }],
  green: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }],
  yellow: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }]
};

const START_POS: Record<string, number> = {
  blue: 0,
  red: 13,
  green: 26,
  yellow: 39
};

const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

const LudoBoard: React.FC<LudoBoardProps> = ({ onWin, onLose, isDark }) => {
  const COLORS = {
    blue: { main: '#0284c7', bg: 'bg-sky-500', icon: '✈️' },
    red: { main: '#e11d48', bg: 'bg-rose-500', icon: '🚀' },
    green: { main: '#10b981', bg: 'bg-emerald-500', icon: '🍀' },
    yellow: { main: '#f59e0b', bg: 'bg-amber-400', icon: '⚡' },
  };

  const [pieces, setPieces] = useState<Piece[]>(() => {
    const p: Piece[] = [];
    (['blue', 'red', 'green', 'yellow'] as const).forEach(color => {
      for (let i = 0; i < 4; i++) {
        p.push({ id: `${color}-${i}`, color, pos: -1, index: i });
      }
    });
    return p;
  });

  const [turn, setTurn] = useState<keyof typeof COLORS>('yellow');
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [activeDie, setActiveDie] = useState<'die1' | 'die2' | 'both' | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [message, setMessage] = useState("Tap center to roll!");
  const [isMoving, setIsMoving] = useState(false);

  const rollDice = useCallback(() => {
    if (turn !== 'yellow' || isRolling || hasRolled || isMoving) return;
    setIsRolling(true);
    setHasRolled(false);
    setActiveDie(null);
    setMessage("Rolling...");
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);
      setIsRolling(false);
      setHasRolled(true);
      setMessage("Choose move type & piece!");
    }, 600);
  }, [turn, isRolling, hasRolled, isMoving]);

  const canMove = (piece: Piece, steps: number) => {
    if (piece.pos === -1) return steps === 6;
    if (piece.pos === 58) return false;
    if (piece.pos >= 52) return piece.pos + steps <= 58;
    return true;
  };

  const animateMove = async (pieceId: string, steps: number) => {
    setIsMoving(true);
    let currentSteps = steps;
    
    for (let i = 0; i < currentSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setPieces(prev => prev.map(p => {
        if (p.id !== pieceId) return p;
        
        let nextPos = p.pos;
        if (p.pos === -1) nextPos = START_POS[p.color];
        else if (p.pos < 51) {
          // Entering home stretch logic
          const homeEntry = (START_POS[p.color] + 50) % 52;
          if (p.pos === homeEntry) nextPos = 52;
          else nextPos = (p.pos + 1) % 52;
        } else {
          nextPos += 1;
        }
        return { ...p, pos: nextPos };
      }));
    }
    
    // Check for capture
    setPieces(prev => {
      const movedPiece = prev.find(p => p.id === pieceId)!;
      if (movedPiece.pos >= 0 && movedPiece.pos < 52 && !SAFE_SQUARES.includes(movedPiece.pos)) {
        return prev.map(p => {
          if (p.color !== movedPiece.color && p.pos === movedPiece.pos) {
            return { ...p, pos: -1 };
          }
          return p;
        });
      }
      return prev;
    });

    setIsMoving(false);
  };

  const handlePieceClick = async (piece: Piece) => {
    if (turn !== 'yellow' || isMoving || !hasRolled || !activeDie) return;
    if (piece.color !== 'yellow') return;

    let steps = 0;
    if (activeDie === 'die1') steps = dice[0];
    else if (activeDie === 'die2') steps = dice[1];
    else steps = dice[0] + dice[1];

    if (canMove(piece, steps)) {
      await animateMove(piece.id, steps);
      setHasRolled(false);
      setActiveDie(null);
      
      // Winner check
      const yellowFinished = pieces.filter(p => p.color === 'yellow' && p.pos === 58).length;
      if (yellowFinished === 4) onWin();

      // Bonus roll for 6
      if (dice[0] === 6 || dice[1] === 6) {
        setMessage("Bonus Roll!");
      } else {
        setTimeout(rotateTurn, 800);
      }
    } else {
      setMessage("Invalid move!");
    }
  };

  const rotateTurn = useCallback(() => {
    const order: (keyof typeof COLORS)[] = ['yellow', 'blue', 'red', 'green'];
    const nextIdx = (order.indexOf(turn) + 1) % 4;
    const nextTurn = order[nextIdx];
    setTurn(nextTurn);
    setHasRolled(false);
    setActiveDie(null);
    if (nextTurn !== 'yellow') simulateAi(nextTurn);
    else setMessage("Your turn!");
  }, [turn, pieces]);

  const simulateAi = async (color: keyof typeof COLORS) => {
    setMessage(`${color.toUpperCase()} thinking...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 6) + 1;
    setDice([r1, r2]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    const myPieces = pieces.filter(p => p.color === color);
    const movable = myPieces.find(p => canMove(p, r1 + r2));
    
    if (movable) {
      await animateMove(movable.id, r1 + r2);
    } else {
      const p1 = myPieces.find(p => canMove(p, r1));
      if (p1) await animateMove(p1.id, r1);
    }
    
    rotateTurn();
  };

  const getVisualCoords = (p: Piece) => {
    if (p.pos === -1) {
      const bases = {
        blue: { x: 1, y: 1 },
        red: { x: 10, y: 1 },
        green: { x: 10, y: 10 },
        yellow: { x: 1, y: 10 }
      };
      const b = bases[p.color];
      const offset = [[1,1], [3,1], [1,3], [3,3]][p.index];
      return { x: b.x + offset[0], y: b.y + offset[1] };
    }
    if (p.pos === 58) return { x: 7.5, y: 7.5 };
    if (p.pos >= 52) {
      const cell = HOME_STRETCH[p.color][p.pos - 52];
      return { x: cell.x + 0.5, y: cell.y + 0.5 };
    }
    return { x: TRACK_COORDS[p.pos].x + 0.5, y: TRACK_COORDS[p.pos].y + 0.5 };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] w-full max-w-2xl mx-auto p-4 select-none">
      {/* Top Banner */}
      <div className={`mb-6 px-8 py-4 rounded-[30px] w-full text-center font-black text-lg shadow-2xl transition-all border-b-8 ${isDark ? 'bg-gray-800 text-white border-naija-green/50' : 'bg-white text-gray-800 border-naija-green'}`}>
        {message}
      </div>

      <div className={`relative w-full aspect-square border-[12px] rounded-[50px] shadow-2xl p-1 overflow-hidden transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        
        {/* Base Images / Sections */}
        {Object.entries(COLORS).map(([color, cfg]) => (
          <div key={color} className={`absolute w-[40%] h-[40%] ${cfg.bg} flex items-center justify-center rounded-[60px] border-8 border-white/20`}
            style={{ 
              top: color === 'blue' || color === 'red' ? 0 : 'auto',
              bottom: color === 'yellow' || color === 'green' ? 0 : 'auto',
              left: color === 'blue' || color === 'yellow' ? 0 : 'auto',
              right: color === 'red' || color === 'green' ? 0 : 'auto'
            }}
          >
            <div className="w-[80%] h-[80%] bg-white/10 rounded-[40px] border-4 border-dashed border-white/30 flex items-center justify-center text-7xl opacity-40 grayscale group-hover:grayscale-0 transition-all">
              {cfg.icon}
            </div>
          </div>
        ))}

        {/* Center Control / Goal */}
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-50 bg-white shadow-2xl rounded-3xl flex items-center justify-center border-4 border-gray-100 overflow-hidden group">
          <div className="flex flex-col items-center p-2">
            <div className="flex gap-2">
              <div className={`text-3xl transition-transform ${isRolling ? 'animate-spin' : ''}`}>
                {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[0]-1]}
              </div>
              <div className={`text-3xl transition-transform ${isRolling ? 'animate-spin' : ''}`}>
                {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[1]-1]}
              </div>
            </div>
            {turn === 'yellow' && !hasRolled && !isRolling && !isMoving && (
              <button onClick={rollDice} className="mt-2 bg-naija-green text-white px-4 py-1 rounded-full font-black text-[10px] uppercase animate-pulse shadow-lg">ROLL</button>
            )}
          </div>
        </div>

        {/* Home Stretches Rendering */}
        {Object.entries(HOME_STRETCH).map(([color, cells]) => (
          cells.map((c, i) => (
            <div key={`${color}-${i}`} className={`absolute w-[6.66%] h-[6.66%] border border-white/20 ${COLORS[color as keyof typeof COLORS].bg}`}
              style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}
            />
          ))
        ))}

        {/* Path Rendering */}
        {TRACK_COORDS.map((c, i) => (
          <div key={i} className={`absolute w-[6.66%] h-[6.66%] border border-gray-200/20 ${SAFE_SQUARES.includes(i) ? 'bg-yellow-100/30' : ''}`}
            style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}>
            {SAFE_SQUARES.includes(i) && <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-20">⭐</span>}
          </div>
        ))}

        {/* Pieces */}
        {pieces.map(p => {
          const visual = getVisualCoords(p);
          const isYellow = p.color === 'yellow';
          const canAct = isYellow && turn === 'yellow' && hasRolled && activeDie && !isMoving;
          
          return (
            <div key={p.id} onClick={() => handlePieceClick(p)}
              className={`absolute w-[6%] h-[6%] rounded-full shadow-2xl border-4 border-white transition-all duration-300 ease-out cursor-pointer z-[60] flex items-center justify-center ${canAct ? 'animate-bounce ring-4 ring-white' : ''}`}
              style={{
                left: `${visual.x * 6.66}%`,
                top: `${visual.y * 6.66}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: COLORS[p.color].main
              }}
            >
              <div className="w-1/2 h-1/2 rounded-full bg-white opacity-40 shadow-inner" />
            </div>
          );
        })}
      </div>

      {/* 3-Button Control Interface */}
      {turn === 'yellow' && hasRolled && !isMoving && (
        <div className="grid grid-cols-3 gap-4 w-full mt-8 animate-pop">
          <button onClick={() => setActiveDie('die1')} 
            className={`py-4 rounded-3xl font-black text-xl shadow-xl transition-all ${activeDie === 'die1' ? 'bg-naija-green text-white scale-105 ring-4 ring-green-200' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[0]}
          </button>
          <button onClick={() => setActiveDie('die2')} 
            className={`py-4 rounded-3xl font-black text-xl shadow-xl transition-all ${activeDie === 'die2' ? 'bg-naija-green text-white scale-105 ring-4 ring-green-200' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[1]}
          </button>
          <button onClick={() => setActiveDie('both')} 
            className={`py-4 rounded-3xl font-black text-xl shadow-xl transition-all ${activeDie === 'both' ? 'bg-orange-500 text-white scale-105 ring-4 ring-orange-200' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[0] + dice[1]}
          </button>
        </div>
      )}

      {/* Turn Status */}
      <div className="flex gap-4 mt-6">
        {Object.keys(COLORS).map(c => (
          <div key={c} className={`w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${turn === c ? 'scale-150 ring-2 ring-naija-green' : 'opacity-20'}`} 
            style={{ backgroundColor: COLORS[c as keyof typeof COLORS].main }} />
        ))}
      </div>
    </div>
  );
};

export default LudoBoard;

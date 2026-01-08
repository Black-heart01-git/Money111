
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Piece {
  id: string;
  color: 'red' | 'blue' | 'yellow' | 'green';
  pos: number; // -1: base, 0-51: track, 52-57: home stretch, 58: home
  index: number;
  icon: string;
}

interface LudoBoardProps {
  onWin: () => void;
  onLose: () => void;
  isDark: boolean;
}

// 15x15 Coordinate System
// Track mapping - Precise Clockwise Path
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
    blue: { main: '#0284c7', bg: 'bg-sky-500', icon: '🥷', theme: 'Anime' },
    red: { main: '#e11d48', bg: 'bg-rose-500', icon: '🦸', theme: 'Hero' },
    green: { main: '#10b981', bg: 'bg-emerald-500', icon: '⚽', theme: 'Footballer' },
    yellow: { main: '#f59e0b', bg: 'bg-amber-400', icon: '🤖', theme: 'Bot' },
  };

  const THEME_ICONS = {
    green: ['⚽', '👟', '🏆', '🏃'], // User: Footballer (Down Right)
    blue: ['🥷', '👹', '🐉', '👺'],   // AI: Anime (Up Left)
    red: ['🦸', '⚡', '🛡️', '☄️'],
    yellow: ['🤖', '🦾', '⚙️', '📡'],
  };

  const [pieces, setPieces] = useState<Piece[]>(() => {
    const p: Piece[] = [];
    (['blue', 'red', 'green', 'yellow'] as const).forEach(color => {
      for (let i = 0; i < 4; i++) {
        p.push({ 
          id: `${color}-${i}`, 
          color, 
          pos: -1, 
          index: i,
          icon: THEME_ICONS[color][i]
        });
      }
    });
    return p;
  });

  // User is Green (Bottom Right), AI is Blue (Top Left)
  const [turn, setTurn] = useState<keyof typeof COLORS>('green');
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [activeDie, setActiveDie] = useState<'die1' | 'die2' | 'both' | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [message, setMessage] = useState("Your turn! Tap ROLL.");
  const [isMoving, setIsMoving] = useState(false);

  const rotateTurn = useCallback(() => {
    // 1v1 Rotation: Green (User) <-> Blue (AI)
    const nextTurn = turn === 'green' ? 'blue' : 'green';
    setTurn(nextTurn);
    setHasRolled(false);
    setActiveDie(null);
    if (nextTurn === 'blue') {
      simulateAi();
    } else {
      setMessage("Your turn!");
    }
  }, [turn]);

  const rollDice = useCallback(() => {
    if (turn !== 'green' || isRolling || hasRolled || isMoving) return;
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

      const canMoveAny = pieces.filter(p => p.color === 'green').some(p => 
        canMove(p, r1) || canMove(p, r2) || canMove(p, r1 + r2)
      );

      if (!canMoveAny) {
        setMessage(`No moves possible (${r1}, ${r2})! Next turn.`);
        setTimeout(rotateTurn, 1500);
      } else {
        setMessage("Choose move and tap your piece!");
      }
    }, 600);
  }, [turn, isRolling, hasRolled, isMoving, pieces, rotateTurn]);

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
      await new Promise(resolve => setTimeout(resolve, 120));
      setPieces(prev => prev.map(p => {
        if (p.id !== pieceId) return p;
        
        let nextPos = p.pos;
        if (p.pos === -1) nextPos = START_POS[p.color];
        else if (p.pos < 51) {
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
    if (turn !== 'green' || isMoving || !hasRolled || !activeDie) return;
    if (piece.color !== 'green') return;

    let steps = 0;
    if (activeDie === 'die1') steps = dice[0];
    else if (activeDie === 'die2') steps = dice[1];
    else steps = dice[0] + dice[1];

    if (canMove(piece, steps)) {
      await animateMove(piece.id, steps);
      setHasRolled(false);
      setActiveDie(null);
      
      const finished = pieces.filter(p => p.color === 'green' && p.pos === 58).length;
      if (finished === 4) onWin();

      if (dice[0] === 6 || dice[1] === 6) {
        setMessage("Lucky 6! You get a bonus.");
      } else {
        setTimeout(rotateTurn, 800);
      }
    } else {
      setMessage("Invalid selection!");
    }
  };

  const simulateAi = async () => {
    setMessage("AI is calculating...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 6) + 1;
    setDice([r1, r2]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    const aiPieces = pieces.filter(p => p.color === 'blue');
    
    const moveBoth = aiPieces.find(p => canMove(p, r1 + r2));
    const move1 = aiPieces.find(p => canMove(p, r1));
    const move2 = aiPieces.find(p => canMove(p, r2));

    if (moveBoth) {
      await animateMove(moveBoth.id, r1 + r2);
    } else if (move1) {
      await animateMove(move1.id, r1);
    } else if (move2) {
      await animateMove(move2.id, r2);
    } else {
      setMessage("AI stuck! Turn returns to you.");
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      <div className={`mb-6 px-8 py-4 rounded-[30px] w-full text-center font-black text-lg shadow-2xl transition-all border-b-8 ${isDark ? 'bg-gray-800 text-white border-naija-green/50' : 'bg-white text-gray-800 border-naija-green'}`}>
        {message}
      </div>

      <div className={`relative w-full aspect-square border-[12px] rounded-[50px] shadow-2xl p-1 overflow-hidden transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        
        {/* Bases Layer */}
        {Object.entries(COLORS).map(([color, cfg]) => (
          <div key={color} className={`absolute w-[40%] h-[40%] ${cfg.bg} flex flex-col items-center justify-center rounded-[60px] border-8 border-white/20`}
            style={{ 
              top: color === 'blue' || color === 'red' ? 0 : 'auto',
              bottom: color === 'yellow' || color === 'green' ? 0 : 'auto',
              left: color === 'blue' || color === 'yellow' ? 0 : 'auto',
              right: color === 'red' || color === 'green' ? 0 : 'auto'
            }}
          >
            <div className="text-6xl opacity-20 drop-shadow-xl">{cfg.icon}</div>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">{cfg.theme}</p>
          </div>
        ))}

        {/* Center Roll Area */}
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-50 bg-white shadow-2xl rounded-3xl flex flex-col items-center justify-center border-4 border-gray-100 overflow-hidden">
          <div className="flex gap-2">
            <div className={`text-3xl ${isRolling ? 'animate-spin' : ''}`}>
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[0]-1]}
            </div>
            <div className={`text-3xl ${isRolling ? 'animate-spin' : ''}`}>
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[1]-1]}
            </div>
          </div>
          {turn === 'green' && !hasRolled && !isRolling && !isMoving && (
            <button onClick={rollDice} className="mt-2 bg-naija-green text-white px-5 py-2 rounded-full font-black text-[10px] uppercase shadow-lg hover:scale-110 active:scale-95 transition-transform">ROLL</button>
          )}
        </div>

        {/* Path Tracks */}
        {TRACK_COORDS.map((c, i) => (
          <div key={i} className={`absolute w-[6.66%] h-[6.66%] border border-gray-200/10 ${SAFE_SQUARES.includes(i) ? 'bg-amber-100/40' : ''}`}
            style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}>
            {SAFE_SQUARES.includes(i) && <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-20">⭐</span>}
          </div>
        ))}

        {/* Pieces Layer */}
        {pieces.map(p => {
          const visual = getVisualCoords(p);
          const isUser = p.color === 'green';
          const canAct = isUser && turn === 'green' && hasRolled && activeDie && !isMoving;
          
          return (
            <div key={p.id} onClick={() => handlePieceClick(p)}
              className={`absolute w-[7%] h-[7%] rounded-full shadow-2xl border-4 border-white transition-all duration-300 ease-out cursor-pointer z-[60] flex items-center justify-center overflow-hidden ${canAct ? 'animate-bounce ring-4 ring-white ring-offset-2' : ''}`}
              style={{
                left: `${visual.x * 6.66}%`,
                top: `${visual.y * 6.66}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: COLORS[p.color].main
              }}
            >
              <span className="text-xl drop-shadow-md select-none">{p.icon}</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Control Buttons */}
      {turn === 'green' && hasRolled && !isMoving && (
        <div className="grid grid-cols-3 gap-4 w-full mt-8 animate-pop">
          <button onClick={() => setActiveDie('die1')} 
            className={`py-4 rounded-3xl font-black text-2xl shadow-xl transition-all ${activeDie === 'die1' ? 'bg-naija-green text-white scale-110 ring-4 ring-green-100' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[0]}
          </button>
          <button onClick={() => setActiveDie('die2')} 
            className={`py-4 rounded-3xl font-black text-2xl shadow-xl transition-all ${activeDie === 'die2' ? 'bg-naija-green text-white scale-110 ring-4 ring-green-100' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[1]}
          </button>
          <button onClick={() => setActiveDie('both')} 
            className={`py-4 rounded-3xl font-black text-2xl shadow-xl transition-all ${activeDie === 'both' ? 'bg-orange-500 text-white scale-110 ring-4 ring-orange-100' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {dice[0] + dice[1]}
          </button>
        </div>
      )}

      {/* Turn Legend */}
      <div className="mt-8 flex items-center gap-8 bg-white/50 dark:bg-gray-800/50 px-8 py-4 rounded-full shadow-inner border border-white/20">
        <div className={`flex items-center gap-3 transition-opacity ${turn === 'green' ? 'opacity-100' : 'opacity-30'}`}>
          <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-[10px]">⚽</div>
          <span className="font-black text-xs uppercase tracking-widest">USER (9ja)</span>
        </div>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        <div className={`flex items-center gap-3 transition-opacity ${turn === 'blue' ? 'opacity-100' : 'opacity-30'}`}>
          <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-sm flex items-center justify-center text-[10px]">🥷</div>
          <span className="font-black text-xs uppercase tracking-widest">AI MASTER</span>
        </div>
      </div>
    </div>
  );
};

export default LudoBoard;


import React, { useState, useEffect, useRef } from 'react';

interface LudoBoardProps {
  onWin: () => void;
  onLose: () => void;
  isDark: boolean;
}

interface Piece {
  id: number;
  color: 'green' | 'red';
  position: number; // -1 is home, 0-40 is path, 100 is goal
}

const LudoBoard: React.FC<LudoBoardProps> = ({ onWin, onLose, isDark }) => {
  const [pieces, setPieces] = useState<Piece[]>([
    { id: 1, color: 'green', position: -1 },
    { id: 2, color: 'green', position: -1 },
    { id: 3, color: 'red', position: -1 },
    { id: 4, color: 'red', position: -1 },
  ]);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState<'green' | 'red'>('green');
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [usedDice, setUsedDice] = useState<[boolean, boolean]>([true, true]);
  const [message, setMessage] = useState("Your Turn! Roll the Dice.");

  const pathLength = 30; // Simplified path for fast toon gameplay

  const rollDice = () => {
    if (turn !== 'green' || isRolling || (!usedDice[0] || !usedDice[1])) return;
    
    setIsRolling(true);
    setMessage("Rolling...");
    
    setTimeout(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      setDice([r1, r2]);
      setUsedDice([false, false]);
      setIsRolling(false);
      setSelectedDieIndex(null);
      setMessage("Pick a number and a seed to move!");
    }, 800);
  };

  const handlePieceClick = (piece: Piece) => {
    if (turn !== 'green' || selectedDieIndex === null || usedDice[selectedDieIndex]) return;
    if (piece.color !== 'green') return;

    movePiece(piece.id, dice[selectedDieIndex]);
  };

  const movePiece = (pieceId: number, steps: number) => {
    setPieces(prev => {
      const next = prev.map(p => {
        if (p.id === pieceId) {
          let newPos = p.position === -1 ? (steps === 6 ? 0 : -1) : p.position + steps;
          if (newPos >= pathLength) newPos = 100; // Goal
          return { ...p, position: newPos };
        }
        return p;
      });
      return next;
    });

    if (selectedDieIndex !== null) {
      // Fix: Use explicit indexing to preserve the tuple type [boolean, boolean] instead of spread which yields boolean[]
      const newUsedDice: [boolean, boolean] = [usedDice[0], usedDice[1]];
      newUsedDice[selectedDieIndex] = true;
      setUsedDice(newUsedDice);
      setSelectedDieIndex(null);

      // If all dice used, switch turn
      if (newUsedDice[0] && newUsedDice[1]) {
        setTimeout(() => setTurn('red'), 1000);
      }
    }
  };

  // AI Turn Logic
  useEffect(() => {
    if (turn === 'red') {
      setMessage("AI is thinking...");
      setTimeout(() => {
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        setDice([r1, r2]);
        
        setTimeout(() => {
          // AI Simple Logic: Move first available piece
          setPieces(prev => {
            let tempPieces = [...prev];
            // Try r1
            let redPieces = tempPieces.filter(p => p.color === 'red' && p.position !== 100);
            if (redPieces.length > 0) {
              const pToMove = redPieces[0];
              const pIdx = tempPieces.findIndex(p => p.id === pToMove.id);
              let newPos = pToMove.position === -1 ? (r1 === 6 ? 0 : -1) : pToMove.position + r1;
              if (newPos >= pathLength) newPos = 100;
              tempPieces[pIdx] = { ...pToMove, position: newPos };
            }
            // Try r2
            redPieces = tempPieces.filter(p => p.color === 'red' && p.position !== 100);
            if (redPieces.length > 0) {
              const pToMove = redPieces[Math.floor(Math.random() * redPieces.length)];
              const pIdx = tempPieces.findIndex(p => p.id === pToMove.id);
              let newPos = pToMove.position === -1 ? (r2 === 6 ? 0 : -1) : pToMove.position + r2;
              if (newPos >= pathLength) newPos = 100;
              tempPieces[pIdx] = { ...pToMove, position: newPos };
            }
            return tempPieces;
          });
          setUsedDice([true, true]);
          setTurn('green');
          setMessage("Your Turn!");
        }, 1000);
      }, 1000);
    }
  }, [turn]);

  // Win Detection
  useEffect(() => {
    const greenWon = pieces.filter(p => p.color === 'green' && p.position === 100).length === 2;
    const redWon = pieces.filter(p => p.color === 'red' && p.position === 100).length === 2;
    if (greenWon) onWin();
    if (redWon) onLose();
  }, [pieces]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className={`p-4 rounded-2xl text-sm font-bold shadow-inner ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {message}
      </div>

      {/* Simplified Board */}
      <div className={`relative w-full aspect-square border-8 rounded-3xl p-4 flex flex-col justify-between shadow-2xl transition-colors ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-white'}`}>
        {/* Corners (Home) */}
        <div className="flex justify-between w-full h-1/4">
          <div className="w-1/3 h-full bg-red-500/20 rounded-2xl border-4 border-dashed border-red-500 flex items-center justify-center gap-1">
            {pieces.filter(p => p.color === 'red' && p.position === -1).map(p => (
              <div key={p.id} className="w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white animate-bounce-short" />
            ))}
          </div>
          <div className="w-1/3 h-full bg-green-500/20 rounded-2xl border-4 border-dashed border-green-500 flex items-center justify-center gap-1">
             {pieces.filter(p => p.color === 'green' && p.position === -1).map(p => (
              <div key={p.id} onClick={() => handlePieceClick(p)} className="w-8 h-8 bg-green-500 rounded-full shadow-lg border-2 border-white cursor-pointer active:scale-90 animate-bounce-short" />
            ))}
          </div>
        </div>

        {/* Path Area (Abstract Visualization) */}
        <div className="flex-1 flex items-center justify-center relative py-4">
           <div className="w-full h-8 bg-white/50 rounded-full flex items-center px-4 relative">
              {pieces.filter(p => p.position >= 0 && p.position < 100).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => p.color === 'green' && handlePieceClick(p)}
                  className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-xl transition-all duration-500 ${p.color === 'green' ? 'bg-green-500 z-10' : 'bg-red-500 z-0'}`}
                  style={{ left: `${(p.position / pathLength) * 85 + 5}%`, top: p.color === 'green' ? '-4px' : '4px' }}
                />
              ))}
              <div className="w-full h-1 bg-gray-300 rounded-full"></div>
           </div>
        </div>

        {/* Goal Area */}
        <div className="h-1/4 w-full flex items-center justify-center gap-4">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-gray-400">FINISH LINE</p>
              <div className="flex gap-2 bg-yellow-400/20 p-2 rounded-2xl border-2 border-yellow-400">
                {pieces.filter(p => p.position === 100).map(p => (
                  <div key={p.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs ${p.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}>🏆</div>
                ))}
                {pieces.filter(p => p.position === 100).length === 0 && <div className="w-8 h-8 opacity-20">🏁</div>}
              </div>
           </div>
        </div>
      </div>

      {/* Dice Area */}
      <div className="flex flex-col items-center gap-4 w-full px-4">
        <div className="flex gap-4">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              disabled={usedDice[idx] || turn !== 'green'}
              onClick={() => setSelectedDieIndex(idx)}
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all transform toon-shadow ${
                selectedDieIndex === idx ? 'scale-110 border-4 border-yellow-400' : ''
              } ${usedDice[idx] ? 'opacity-30 grayscale' : 'bg-white shadow-xl'} ${isRolling ? 'animate-spin' : ''}`}
            >
              <span className="text-4xl">{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[idx] - 1]}</span>
              <span className="text-[10px] font-black mt-1">{dice[idx]}</span>
            </button>
          ))}
        </div>

        <button
          onClick={rollDice}
          disabled={turn !== 'green' || !usedDice[0] || !usedDice[1] || isRolling}
          className={`w-full py-5 rounded-3xl font-black text-xl text-white shadow-xl transition-all active:translate-y-1 ${
            turn === 'green' && usedDice[0] && usedDice[1] && !isRolling
              ? 'bg-naija-green animate-bounce shadow-green-200'
              : 'bg-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          {isRolling ? 'ROLLING...' : 'TAP TO ROLL DICE'}
        </button>
      </div>
    </div>
  );
};

export default LudoBoard;

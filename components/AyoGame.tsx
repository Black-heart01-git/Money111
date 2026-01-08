
import React, { useState } from 'react';

const AyoGame: React.FC<{ onWin: () => void; onLose: () => void; isDark: boolean }> = ({ onWin, onLose, isDark }) => {
  const [board, setBoard] = useState(new Array(12).fill(4));
  const [score, setScore] = useState([0, 0]); // [Player, AI]
  const [turn, setTurn] = useState(0);
  const [animating, setAnimating] = useState(false);

  const sow = async (startIdx: number) => {
    if (animating || turn !== 0 || board[startIdx] === 0 || startIdx >= 6) return;
    setAnimating(true);
    
    let seeds = board[startIdx];
    let currentBoard = [...board];
    currentBoard[startIdx] = 0;
    setBoard([...currentBoard]);

    let curr = startIdx;
    while (seeds > 0) {
      await new Promise(r => setTimeout(r, 300));
      curr = (curr + 1) % 12;
      currentBoard[curr]++;
      seeds--;
      setBoard([...currentBoard]);
    }

    // Capture logic (land in opponent's hole and make it 2 or 3)
    if (curr >= 6 && (currentBoard[curr] === 2 || currentBoard[curr] === 3)) {
       setScore([score[0] + currentBoard[curr], score[1]]);
       currentBoard[curr] = 0;
       setBoard([...currentBoard]);
    }

    setTurn(1);
    setAnimating(false);
    
    // AI Move
    setTimeout(() => aiMove(currentBoard), 1000);
  };

  const aiMove = async (b: number[]) => {
    setAnimating(true);
    const validPits = [6,7,8,9,10,11].filter(i => b[i] > 0);
    if (!validPits.length) { setTurn(0); setAnimating(false); return; }
    
    const startIdx = validPits[Math.floor(Math.random() * validPits.length)];
    let seeds = b[startIdx];
    let currentBoard = [...b];
    currentBoard[startIdx] = 0;
    setBoard([...currentBoard]);

    let curr = startIdx;
    while (seeds > 0) {
      await new Promise(r => setTimeout(r, 300));
      curr = (curr + 1) % 12;
      currentBoard[curr]++;
      seeds--;
      setBoard([...currentBoard]);
    }

    if (curr < 6 && (currentBoard[curr] === 2 || currentBoard[curr] === 3)) {
       setScore([score[0], score[1] + currentBoard[curr]]);
       currentBoard[curr] = 0;
       setBoard([...currentBoard]);
    }

    setTurn(0);
    setAnimating(false);
    
    if (score[0] >= 24) onWin();
    if (score[1] >= 24) onLose();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-12">
      <div className="flex justify-between w-full max-w-sm font-black uppercase text-xs">
        <div className="text-gray-400">AI: {score[1]}</div>
        <div className="text-naija-green">YOU: {score[0]}</div>
      </div>

      <div className="grid grid-cols-6 grid-rows-2 gap-4 bg-[#8b4513] p-6 rounded-[50px] shadow-2xl border-[10px] border-[#5d2e0d]">
        {[11,10,9,8,7,6].map(i => (
          <div key={i} className="w-14 h-14 rounded-full bg-[#3d1e09] shadow-inner flex flex-wrap items-center justify-center p-1">
            {new Array(board[i]).fill(0).map((_, j) => <div key={j} className="w-2 h-2 bg-yellow-900 rounded-full m-0.5"></div>)}
          </div>
        ))}
        {board.slice(0, 6).map((seeds, i) => (
          <button key={i} disabled={animating || turn !== 0} onClick={() => sow(i)} className={`w-14 h-14 rounded-full bg-[#3d1e09] shadow-inner flex flex-wrap items-center justify-center p-1 transition-transform ${seeds > 0 && !animating && 'hover:scale-110 active:scale-95'}`}>
            {new Array(seeds).fill(0).map((_, j) => <div key={j} className="w-2 h-2 bg-green-200 rounded-full m-0.5 shadow-sm"></div>)}
          </button>
        ))}
      </div>

      <p className="font-black text-naija-green text-sm uppercase animate-pulse">{turn === 0 ? 'Your Move' : 'AI Thinking...'}</p>
    </div>
  );
};

export default AyoGame;

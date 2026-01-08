
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
  multiplayerMode?: 'ai' | 'online' | 'local';
  myColor?: 'green' | 'blue';
}

// 15x15 Precise Coordinate Mapping
const TRACK_COORDS: { x: number; y: number }[] = [
  { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
  { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 },
  { x: 0, y: 7 }, { x: 0, y: 8 },
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
  { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 },
  { x: 7, y: 14 }, { x: 8, y: 14 },
  { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 },
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
  { x: 14, y: 7 }, { x: 14, y: 6 },
  { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 },
  { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, { x: 8, y: 0 },
  { x: 7, y: 0 }, { x: 6, y: 0 }
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

const LudoBoard: React.FC<LudoBoardProps> = ({ 
  onWin, 
  onLose, 
  isDark, 
  multiplayerMode = 'ai', 
  myColor = 'green' 
}) => {
  const COLORS = {
    blue: { main: '#0284c7', bg: 'bg-sky-500', name: 'PLAYER 2' },
    red: { main: '#e11d48', bg: 'bg-rose-500', name: 'RED HEROES' },
    green: { main: '#10b981', bg: 'bg-emerald-500', name: 'PLAYER 1' },
    yellow: { main: '#f59e0b', bg: 'bg-amber-400', name: 'BOT TEAM' },
  };

  const THEMES = {
    green: [
      'https://unavatar.io/twitter/leomessisite',
      'https://unavatar.io/twitter/cristiano',
      'https://unavatar.io/twitter/kmbappe',
      'https://unavatar.io/twitter/mosalah'
    ],
    blue: [
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Naruto',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Goku',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoro'
    ],
    red: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero4'
    ],
    yellow: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Bot1',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Bot2',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Bot3',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Bot4'
    ],
  };

  const channel = useRef<BroadcastChannel | null>(null);
  const [pieces, setPieces] = useState<Piece[]>(() => {
    const p: Piece[] = [];
    (['blue', 'red', 'green', 'yellow'] as const).forEach(color => {
      for (let i = 0; i < 4; i++) {
        p.push({ id: `${color}-${i}`, color, pos: -1, index: i, icon: THEMES[color][i] });
      }
    });
    return p;
  });

  const [turn, setTurn] = useState<keyof typeof COLORS>('green');
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [isShakingCup, setIsShakingCup] = useState(false);
  const [activeDie, setActiveDie] = useState<'die1' | 'die2' | 'both' | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [message, setMessage] = useState("Tap to shake and roll!");
  const [movingPieceId, setMovingPieceId] = useState<string | null>(null);
  const [capturedPieceId, setCapturedPieceId] = useState<string | null>(null);

  const audioContext = useRef<AudioContext | null>(null);

  const playSound = (freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.1) => {
    try {
      if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioContext.current.destination);
      osc.start();
      osc.stop(audioContext.current.currentTime + duration);
    } catch(e) {}
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const broadcastEvent = (type: string, data: any) => {
    if (multiplayerMode === 'online' && channel.current) {
      channel.current.postMessage({ type, data, sender: myColor });
    }
  };

  const rotateTurn = useCallback(() => {
    const nextTurn = turn === 'green' ? 'blue' : 'green';
    setTurn(nextTurn);
    setHasRolled(false);
    setActiveDie(null);

    if (multiplayerMode === 'ai' && nextTurn === 'blue') {
      simulateAi();
    } else {
      const turnMsg = nextTurn === myColor ? "Your turn! Shake it up!" : `Waiting for ${nextTurn}...`;
      setMessage(turnMsg);
      if (nextTurn === myColor) speak("It is your turn.");
    }
  }, [turn, multiplayerMode, myColor]);

  // Handle Multiplayer Messages
  useEffect(() => {
    if (multiplayerMode === 'online') {
      channel.current = new BroadcastChannel('money11_ludo');
      channel.current.onmessage = (event) => {
        const { type, data, sender } = event.data;
        if (sender === myColor) return; 

        switch (type) {
          case 'DICE_ROLL':
            setDice(data.dice);
            setHasRolled(true);
            setMessage(`${sender} rolled ${data.dice[0]} & ${data.dice[1]}`);
            break;
          case 'PIECE_MOVE':
            animateMove(data.pieceId, data.steps, true);
            break;
          case 'TURN_CHANGE':
            setTurn(data.nextTurn);
            setHasRolled(false);
            setActiveDie(null);
            setMessage(data.nextTurn === myColor ? "Your turn!" : `Waiting for ${data.nextTurn}...`);
            if (data.nextTurn === myColor) speak("Your turn.");
            break;
        }
      };
    }
    return () => channel.current?.close();
  }, [multiplayerMode, myColor]);

  const rollDice = useCallback(() => {
    if (turn !== myColor || isRolling || isShakingCup || hasRolled || movingPieceId) return;
    
    setIsShakingCup(true);
    setMessage("Shaking...");
    playSound(150, 'square', 0.4, 0.05);
    speak("Shaking the cup.");

    setTimeout(() => {
      setIsShakingCup(false);
      setIsRolling(true);
      setMessage("Rolling...");
      
      const tumbleInterval = setInterval(() => {
        setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
        playSound(400 + Math.random() * 200, 'sine', 0.05, 0.03);
      }, 80);

      setTimeout(() => {
        clearInterval(tumbleInterval);
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        const finalDice: [number, number] = [r1, r2];
        setDice(finalDice);
        setIsRolling(false);
        setHasRolled(true);
        playSound(440, 'sine', 0.2, 0.08);
        speak(`You rolled ${r1} and ${r2}.`);

        broadcastEvent('DICE_ROLL', { dice: finalDice });

        const myPieces = pieces.filter(p => p.color === myColor);
        const canMove1 = myPieces.some(p => canMove(p, r1));
        const canMove2 = myPieces.some(p => canMove(p, r2));
        const canMoveBoth = myPieces.some(p => canMove(p, r1 + r2));

        if (!canMove1 && !canMove2 && !canMoveBoth) {
          setMessage(`No valid moves!`);
          speak("No valid moves. Skipping turn.");
          setTimeout(() => {
            const nextTurn = turn === 'green' ? 'blue' : 'green';
            broadcastEvent('TURN_CHANGE', { nextTurn });
            rotateTurn();
          }, 1500);
        } else {
          setMessage("Choose your move!");
        }
      }, 1000);
    }, 1000);
  }, [turn, isRolling, isShakingCup, hasRolled, movingPieceId, pieces, rotateTurn, myColor, multiplayerMode]);

  const canMove = (piece: Piece, steps: number) => {
    if (piece.pos === -1) return steps === 6;
    if (piece.pos === 58) return false;
    if (piece.pos < 52) {
      const journey = getJourneyLength(piece);
      if (journey + steps > 57) return false;
    } else if (piece.pos >= 52) {
      return piece.pos + steps <= 58;
    }
    return true;
  };

  const getJourneyLength = (piece: Piece) => {
    if (piece.pos === -1) return 0;
    if (piece.pos >= 52) return piece.pos - 52 + 51;
    return piece.pos >= START_POS[piece.color] 
      ? piece.pos - START_POS[piece.color] 
      : (52 - START_POS[piece.color]) + piece.pos;
  };

  const animateMove = async (pieceId: string, steps: number, remote: boolean = false) => {
    setMovingPieceId(pieceId);
    if (!remote) broadcastEvent('PIECE_MOVE', { pieceId, steps });

    let capturedInThisMove = false;
    let currentSteps = steps;
    
    for (let i = 0; i < currentSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Subtle click sound per step
      playSound(800 + (i * 5), 'sine', 0.02, 0.04); 
      
      setPieces(prev => prev.map(p => {
        if (p.id !== pieceId) return p;
        let nextPos = p.pos;
        if (p.pos === -1) nextPos = START_POS[p.color];
        else if (p.pos < 52) {
          const journey = getJourneyLength(p);
          if (journey === 50) nextPos = 52; 
          else nextPos = (p.pos + 1) % 52;
        } else nextPos += 1;
        return { ...p, pos: nextPos };
      }));
    }
    
    setPieces(prev => {
      const movedPiece = prev.find(p => p.id === pieceId)!;
      if (movedPiece.pos === 58) {
        playSound(880, 'sine', 0.3, 0.1);
        speak("Goal! Piece reached home!");
        if (movedPiece.color === myColor) {
           const finished = prev.filter(p => p.color === myColor && p.pos === 58).length + 1;
           if (finished === 4) onWin();
        }
      }

      if (movedPiece.pos >= 0 && movedPiece.pos < 52 && !SAFE_SQUARES.includes(movedPiece.pos)) {
        let victimId: string | null = null;
        const nextPieces = prev.map(p => {
          if (p.color !== movedPiece.color && p.pos === movedPiece.pos) {
            victimId = p.id;
            return { ...p, pos: -1 };
          }
          return p;
        });
        
        if (victimId) {
          capturedInThisMove = true;
          setCapturedPieceId(victimId);
          playSound(150, 'sawtooth', 0.4, 0.08);
          speak("Critical Hit! Captured!");
          setTimeout(() => setCapturedPieceId(null), 1000);
        }
        return nextPieces;
      }
      return prev;
    });

    setMovingPieceId(null);
    
    if (!remote) {
      // Bonus turn only on Double 6 or Capture
      const isDoubleSix = (dice[0] === 6 && dice[1] === 6);
      
      if (isDoubleSix || capturedInThisMove) {
         setHasRolled(false);
         setActiveDie(null);
         setMessage(isDoubleSix ? "Double Six! Roll again!" : "Captured! Bonus Turn!");
         speak(isDoubleSix ? "Double six! You get another roll." : "You captured a piece! Take another turn.");
      } else {
        const nextTurn = turn === 'green' ? 'blue' : 'green';
        broadcastEvent('TURN_CHANGE', { nextTurn });
        setTimeout(rotateTurn, 800);
      }
    }
  };

  const handlePieceClick = async (piece: Piece) => {
    if (turn !== myColor || movingPieceId || !hasRolled || !activeDie) return;
    if (piece.color !== myColor) return;

    let steps = 0;
    if (activeDie === 'die1') steps = dice[0];
    else if (activeDie === 'die2') steps = dice[1];
    else steps = dice[0] + dice[1];

    if (canMove(piece, steps)) {
      await animateMove(piece.id, steps);
    } else {
      playSound(100, 'square', 0.2, 0.05);
      speak("Invalid move.");
    }
  };

  const simulateAi = async () => {
    setMessage("AI thinking...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRolling(true);
    const tumbleInterval = setInterval(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    }, 80);

    await new Promise(resolve => setTimeout(resolve, 800));
    clearInterval(tumbleInterval);
    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 6) + 1;
    setDice([r1, r2]);
    setIsRolling(false);
    
    const aiPieces = pieces.filter(p => p.color === 'blue');
    const moveBoth = aiPieces.find(p => canMove(p, r1 + r2));
    const move1 = aiPieces.find(p => canMove(p, r1));
    const move2 = aiPieces.find(p => canMove(p, r2));

    if (moveBoth) await animateMove(moveBoth.id, r1 + r2, true);
    else if (move1) await animateMove(move1.id, r1, true);
    else if (move2) await animateMove(move2.id, r2, true);
    
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
    <div className={`flex flex-col items-center justify-center min-h-[95vh] w-full max-w-2xl mx-auto p-4 select-none transition-transform duration-100 ${isShakingCup ? 'scale-[1.01]' : ''}`}>
      <div className={`mb-4 px-6 py-4 rounded-3xl w-full text-center font-black text-lg shadow-xl transition-all border-b-8 border-naija-green/30 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-naija-green uppercase tracking-tighter font-black">
            {multiplayerMode === 'online' ? `Lobby: ${myColor === 'green' ? 'MASTER' : 'GUEST'}` : 'MONEY11 ARENA'}
          </span>
          <span className="text-[10px] text-blue-400 uppercase tracking-tighter">Live Match</span>
        </div>
        {message}
      </div>

      <div className={`relative w-full aspect-square border-[16px] rounded-[60px] shadow-2xl p-1 overflow-hidden transition-colors board-brown-anim border-[#3e2723] ${isShakingCup ? 'animate-dice-shake' : ''}`}>
        {Object.entries(COLORS).map(([color, cfg]) => (
          <div key={color} className={`absolute w-[40%] h-[40%] ${cfg.bg} flex flex-col items-center justify-center rounded-[40px] border-8 border-white/30 shadow-inner overflow-hidden`}
            style={{ 
              top: color === 'blue' || color === 'red' ? 0 : 'auto',
              bottom: color === 'yellow' || color === 'green' ? 0 : 'auto',
              left: color === 'blue' || color === 'yellow' ? 0 : 'auto',
              right: color === 'red' || color === 'green' ? 0 : 'auto'
            }}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
             <div className="relative w-24 h-24 opacity-20 drop-shadow-2xl flex items-center justify-center">
                {color === 'green' ? <span className="text-6xl">⚽</span> : color === 'blue' ? <span className="text-6xl">🥷</span> : <span className="text-6xl">⭐</span>}
             </div>
             <p className="relative text-[8px] font-black uppercase text-white/50 tracking-[0.2em] mt-2">{cfg.name}</p>
          </div>
        ))}

        {TRACK_COORDS.map((c, i) => (
          <div key={i} className={`absolute w-[6.66%] h-[6.66%] border border-black/10 flex items-center justify-center ${SAFE_SQUARES.includes(i) ? 'bg-yellow-200/30' : 'bg-white/20'}`}
            style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}>
            {SAFE_SQUARES.includes(i) && <span className="text-[8px] opacity-30">⭐</span>}
          </div>
        ))}

        {Object.entries(HOME_STRETCH).map(([color, cells]) => (
          cells.map((c, i) => (
            <div key={`${color}-${i}`} className={`absolute w-[6.66%] h-[6.66%] border border-black/10 ${COLORS[color as keyof typeof COLORS].bg} opacity-50`}
              style={{ left: `${c.x * 6.66}%`, top: `${c.y * 6.66}%` }}
            />
          ))
        ))}

        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-50 bg-white shadow-2xl rounded-3xl flex flex-col items-center justify-center border-4 border-gray-100 overflow-hidden">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {isShakingCup ? (
              <div className="flex flex-col items-center animate-dice-shake scale-125">
                <span className="text-5xl mb-1">🥤</span>
              </div>
            ) : (
              <div className={`flex gap-2 transition-all duration-300 ${isRolling ? 'scale-125 rotate-12 blur-[1px]' : ''}`}>
                <div className={`dice-face w-10 h-10 text-3xl ${isRolling ? 'animate-spin' : ''}`}>
                  {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[0]-1]}
                </div>
                <div className={`dice-face w-10 h-10 text-3xl ${isRolling ? 'animate-spin' : ''}`}>
                  {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[1]-1]}
                </div>
              </div>
            )}
            
            {turn === myColor && !hasRolled && !isRolling && !isShakingCup && !movingPieceId && (
              <button onClick={rollDice} className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 group transition-all">
                <span className="text-4xl mb-1 group-hover:scale-110">🥤</span>
                <span className="bg-naija-green text-white px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-tighter">
                  ROLL DICE
                </span>
              </button>
            )}
          </div>
        </div>

        {pieces.map(p => {
          const visual = getVisualCoords(p);
          const isUser = p.color === myColor;
          const isTurn = turn === myColor;
          const isMoving = movingPieceId === p.id;
          const isCaptured = capturedPieceId === p.id;
          const canAct = isUser && isTurn && hasRolled && activeDie && !movingPieceId;
          
          return (
            <div key={p.id} onClick={() => handlePieceClick(p)}
              className={`absolute w-[7.5%] h-[7.5%] rounded-full shadow-2xl border-[3px] border-white/90 z-[60] flex items-center justify-center piece-shadow 
                transition-all duration-300 ease-out cursor-pointer overflow-hidden
                ${canAct ? 'animate-bounce ring-4 ring-white/50 ring-offset-2' : 'hover:scale-110'}
                ${isMoving ? '-translate-y-4 scale-125 z-[70]' : ''}
                ${isCaptured ? 'scale-150 rotate-[360deg] opacity-0 blur-sm duration-700' : ''}`}
              style={{
                left: `${visual.x * 6.66}%`,
                top: `${visual.y * 6.66}%`,
                transform: `translate(-50%, -50%) ${isMoving ? 'translateY(-15px)' : ''}`,
                backgroundColor: COLORS[p.color].main,
                opacity: p.pos === 58 ? 0.3 : 1
              }}
            >
              <img src={p.icon} className="w-full h-full object-cover rounded-full" />
            </div>
          );
        })}
      </div>

      {turn === myColor && hasRolled && !movingPieceId && (
        <div className="grid grid-cols-3 gap-4 w-full mt-8 animate-pop">
          {[
            { id: 'die1', val: dice[0], label: 'USE 1' },
            { id: 'die2', val: dice[1], label: 'USE 2' },
            { id: 'both', val: dice[0] + dice[1], label: 'TOTAL' }
          ].map(btn => (
            <button key={btn.id} onClick={() => { setActiveDie(btn.id as any); speak(`Selected ${btn.val}`); }} className={`relative py-5 rounded-[30px] font-black shadow-xl border-4 ${activeDie === btn.id ? 'bg-naija-green text-white border-white scale-110' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>
              <span className="block text-2xl tracking-tighter leading-none">{btn.val}</span>
              <span className="block text-[8px] opacity-60 mt-1 uppercase font-bold tracking-widest">{btn.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between w-full px-8 bg-black/5 py-4 rounded-[40px] border border-black/5">
        <div className={`flex items-center gap-3 transition-all ${turn === 'green' ? 'scale-110 opacity-100' : 'opacity-30 grayscale'}`}>
           <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
              <img src={THEMES.green[0]} className="w-full h-full object-cover" />
           </div>
           <div className="text-left">
             <p className="font-black text-xs">{myColor === 'green' ? 'CHIDI (YOU)' : 'PLAYER 1'}</p>
             <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                {turn === 'green' && <div className="h-full bg-emerald-500 w-full animate-pulse"></div>}
             </div>
           </div>
        </div>
        <div className="text-naija-green font-black text-xl italic tracking-tighter">VS</div>
        <div className={`flex items-center gap-3 transition-all ${turn === 'blue' ? 'scale-110 opacity-100' : 'opacity-30 grayscale'}`}>
           <div className="text-right">
             <p className="font-black text-xs">{myColor === 'blue' ? 'MASTER BOT' : multiplayerMode === 'ai' ? 'AI SQUAD' : 'PLAYER 2'}</p>
             <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1 flex justify-end">
                {turn === 'blue' && <div className="h-full bg-sky-500 w-full animate-pulse"></div>}
             </div>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
              <img src={THEMES.blue[0]} className="w-full h-full object-cover" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default LudoBoard;

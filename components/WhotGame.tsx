
import React, { useState, useEffect, useCallback } from 'react';

type Shape = 'Circle' | 'Triangle' | 'Square' | 'Star' | 'Cross' | 'Whot';
interface Card { id: number; shape: Shape; number: number; }

const SHAPES: Shape[] = ['Circle', 'Triangle', 'Square', 'Star', 'Cross'];
const SHAPE_ICONS: Record<Shape, string> = {
  Circle: '⚪', Triangle: '🔺', Square: '⬛', Star: '⭐', Cross: '✖️', Whot: '🇳🇬'
};

interface WhotGameProps { onWin: () => void; onLose: () => void; isDark: boolean; }

const WhotGame: React.FC<WhotGameProps> = ({ onWin, onLose, isDark }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [pile, setPile] = useState<Card[]>([]);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [message, setMessage] = useState('Game Start! Your turn.');
  const [requestedShape, setRequestedShape] = useState<Shape | null>(null);

  const playSound = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = freq;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  };

  const initGame = useCallback(() => {
    const newDeck: Card[] = [];
    let id = 0;
    SHAPES.forEach(shape => {
      const nums = shape === 'Star' ? [1,2,3,4,5,7,8] : [1,2,3,4,5,7,8,10,11,12,13,14];
      nums.forEach(n => newDeck.push({ id: id++, shape, number: n }));
    });
    for(let i=0; i<5; i++) newDeck.push({ id: id++, shape: 'Whot', number: 20 });
    
    const shuffled = newDeck.sort(() => Math.random() - 0.5);
    setPlayerHand(shuffled.slice(0, 6));
    setAiHand(shuffled.slice(6, 12));
    setPile([shuffled[12]]);
    setDeck(shuffled.slice(13));
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const canPlay = (card: Card) => {
    const top = pile[pile.length - 1];
    if (card.shape === 'Whot') return true;
    if (requestedShape) return card.shape === requestedShape;
    return card.shape === top.shape || card.number === top.number;
  };

  const handleDraw = () => {
    if (turn !== 'player' || deck.length === 0) return;
    const newCard = deck[0];
    setPlayerHand([...playerHand, newCard]);
    setDeck(deck.slice(1));
    playSound(400);
    setTurn('ai');
  };

  const handlePlay = (card: Card) => {
    if (turn !== 'player' || !canPlay(card)) return;
    
    setPlayerHand(playerHand.filter(c => c.id !== card.id));
    setPile([...pile, card]);
    playSound(800);
    setRequestedShape(null);

    if (playerHand.length === 1) { onWin(); return; }

    // Special Card Logic
    if (card.number === 1) setMessage('Hold on!');
    else if (card.number === 2) { setMessage('Pick Two!'); /* AI should pick 2 */ }
    else if (card.shape === 'Whot') { setRequestedShape('Circle'); /* Simple auto-select */ }

    setTurn('ai');
  };

  useEffect(() => {
    if (turn === 'ai') {
      setTimeout(() => {
        const playable = aiHand.find(canPlay);
        if (playable) {
          setAiHand(aiHand.filter(c => c.id !== playable.id));
          setPile([...pile, playable]);
          playSound(600);
          if (aiHand.length === 1) onLose();
        } else {
          const newCard = deck[0];
          setAiHand([...aiHand, newCard]);
          setDeck(deck.slice(1));
        }
        setTurn('player');
      }, 1500);
    }
  }, [turn]);

  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] p-4 font-black">
      <div className="w-full bg-white/10 p-4 rounded-3xl text-center shadow-xl border-2 border-white/20">
        <p className="text-xs text-naija-green uppercase">AI Hand: {aiHand.length} Cards</p>
        <div className="flex justify-center -space-x-4 mt-2">
          {aiHand.map((_, i) => <div key={i} className="w-10 h-14 bg-gray-800 rounded-lg border-2 border-white/10 shadow-lg"></div>)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <p className="bg-naija-green text-white px-4 py-1 rounded-full text-xs animate-bounce">{message}</p>
        <div className="relative w-24 h-36">
           <div className="absolute inset-0 bg-white rounded-xl shadow-2xl border-4 border-naija-green flex flex-col items-center justify-center">
             <span className="text-4xl">{SHAPE_ICONS[pile[pile.length-1].shape]}</span>
             <span className="text-2xl mt-1">{pile[pile.length-1].number}</span>
           </div>
        </div>
        {requestedShape && <p className="text-xs text-blue-500 uppercase">I want {requestedShape}</p>}
      </div>

      <div className="w-full space-y-4">
        <div className="flex overflow-x-auto gap-3 pb-4 px-2">
          {playerHand.map(card => (
            <button key={card.id} onClick={() => handlePlay(card)} className={`flex-shrink-0 w-20 h-28 rounded-xl border-4 transition-all ${canPlay(card) ? 'border-naija-green scale-105 shadow-green-500/20 shadow-xl' : 'border-gray-200 opacity-50'} bg-white text-gray-900 flex flex-col items-center justify-center`}>
               <span className="text-3xl">{SHAPE_ICONS[card.shape]}</span>
               <span className="text-xl">{card.number}</span>
            </button>
          ))}
          <button onClick={handleDraw} className="flex-shrink-0 w-20 h-28 rounded-xl border-4 border-dashed border-gray-400 bg-black/5 flex flex-col items-center justify-center text-gray-400">
             <span className="text-3xl">➕</span>
             <span className="text-[10px] font-bold">DRAW</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhotGame;

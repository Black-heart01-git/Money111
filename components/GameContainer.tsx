
import React, { useState, useEffect, useRef } from 'react';
import { User, GameType } from '../types';
import { GAMES, STAKE_OPTIONS } from '../constants';
import { generateAfrobeatsQuestions } from '../services/geminiService';
import LudoBoard from './LudoBoard';

interface GameContainerProps {
  gameId: string;
  user: User;
  isDark: boolean;
  onClose: () => void;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameId, user, isDark, onClose, onWin, onLose }) => {
  const [gameState, setGameState] = useState<'mode_selection' | 'stake_selection' | 'lobby' | 'playing' | 'result'>('mode_selection');
  const [multiplayerMode, setMultiplayerMode] = useState<'ai' | 'online' | 'local'>('ai');
  const [selectedStake, setSelectedStake] = useState<number>(500);
  const [loading, setLoading] = useState(false);
  const [lobbyTime, setLobbyTime] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<'green' | 'blue'>('green');
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const gameInfo = GAMES.find(g => g.id === gameId);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let interval: any;
    if (gameState === 'lobby') {
      if (multiplayerMode === 'online') {
        // Broadcast discovery
        channel.current = new BroadcastChannel('money11_matchmaking');
        channel.current.postMessage({ type: 'DISCOVER_PLAYER', user: user.fullName });
        
        channel.current.onmessage = (event) => {
          if (event.data.type === 'DISCOVER_PLAYER' && !opponent) {
            setOpponent(event.data.user);
            setMyColor('green');
            channel.current?.postMessage({ type: 'PLAYER_FOUND', user: user.fullName });
          } else if (event.data.type === 'PLAYER_FOUND' && !opponent) {
            setOpponent(event.data.user);
            setMyColor('blue');
          }
        };
      }

      interval = setInterval(() => {
        setLobbyTime(prev => {
          const next = prev + 1;
          if (next >= 15 && !opponent && multiplayerMode === 'ai') {
            setOpponent('AI Master');
          }
          if (next >= 40 && multiplayerMode === 'ai' && opponent) {
             startGame();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      channel.current?.close();
    };
  }, [gameState, opponent, multiplayerMode]);

  const selectMode = (mode: 'ai' | 'online' | 'local') => {
    setMultiplayerMode(mode);
    setGameState('stake_selection');
  };

  const selectStake = (amount: number) => {
    if (user.balance < amount) {
      alert("Insufficient balance!");
      return;
    }
    setSelectedStake(amount);
    setGameState('lobby');
  };

  const startGame = async () => {
    setLoading(true);
    if (gameId === 'music') {
      const q = await generateAfrobeatsQuestions();
      setQuestions(q);
    }
    setLoading(false);
    setGameState('playing');
  };

  const finishGame = (win: boolean) => {
    setGameState('result');
    if (win) {
      setScore(5);
      onWin(selectedStake);
    } else {
      setScore(0);
      onLose(selectedStake);
    }
  };

  const renderModeSelection = () => (
    <div className="flex-1 flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-black mb-1">Choose Mode</h3>
        <p className="text-sm text-gray-500">How do you want to play?</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => selectMode('ai')} className="p-6 rounded-3xl bg-white border-4 border-gray-100 font-black text-xl flex items-center justify-between hover:border-naija-green transition-all">
          <span>Solo vs AI</span>
          <span className="text-2xl">🤖</span>
        </button>
        <button onClick={() => selectMode('online')} className="p-6 rounded-3xl bg-white border-4 border-gray-100 font-black text-xl flex items-center justify-between hover:border-naija-green transition-all">
          <div>
            <p>Online Multiplayer</p>
            <p className="text-[10px] text-naija-green font-bold uppercase">Cross-Tab Matchmaking</p>
          </div>
          <span className="text-2xl">🌍</span>
        </button>
      </div>
    </div>
  );

  const renderStakeSelection = () => (
    <div className="flex-1 flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-black mb-1">Select Your Stake</h3>
        <p className="text-sm text-gray-500">Double your Naira!</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {STAKE_OPTIONS.map(amount => (
          <button
            key={amount}
            onClick={() => selectStake(amount)}
            className={`p-6 rounded-3xl border-4 font-black text-xl transition-all ${
              user.balance < amount 
                ? 'bg-gray-100 border-gray-200 text-gray-300' 
                : 'bg-white border-naija-green text-naija-green'
            }`}
          >
            ₦{amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6 text-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-8 border-naija-green border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-black">{opponent ? '✓' : '...'}</div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-black">{opponent ? 'Opponent Found!' : 'Matchmaking...'}</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{multiplayerMode === 'online' ? 'Open another tab to join!' : 'Finding a pro bot...'}</p>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-dashed border-gray-200 w-full max-w-xs mx-auto">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">You</span>
            <span className="text-naija-green font-black">VS</span>
            <span className="font-bold text-sm">{opponent || '???'}</span>
          </div>
        </div>
      </div>

      {opponent && (
        <button onClick={startGame} className="w-full max-w-xs bg-naija-green text-white py-5 rounded-3xl font-black text-xl animate-pulse">
          READY? START!
        </button>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col animate-pop ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center p-6">
        <button onClick={onClose} className="text-3xl font-black bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center">✕</button>
        <div className="text-center">
          <h2 className="font-black text-xl">{gameInfo?.name}</h2>
          <span className="bg-naija-green text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
            {multiplayerMode === 'online' ? 'REAL PLAYER' : 'AI MATCH'}
          </span>
        </div>
        <div className="w-12 h-12 bg-naija-green/10 rounded-2xl flex items-center justify-center text-xl">{gameInfo?.icon}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {gameState === 'mode_selection' && renderModeSelection()}
        {gameState === 'stake_selection' && renderStakeSelection()}
        {gameState === 'lobby' && renderLobby()}
        
        {gameState === 'playing' && gameId === 'ludo' && (
          <LudoBoard 
            isDark={isDark} 
            multiplayerMode={multiplayerMode}
            myColor={myColor}
            onWin={() => finishGame(true)} 
            onLose={() => finishGame(false)} 
          />
        )}

        {gameState === 'playing' && gameId === 'music' && (
          <div className="p-6">Music Quiz coming soon...</div>
        )}

        {gameState === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6">
            <div className="text-9xl animate-bounce">{score >= 3 ? '🎉' : '💀'}</div>
            <div className="text-center">
              <h2 className="text-5xl font-black">₦{score >= 3 ? (selectedStake * 2).toLocaleString() : '0'}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">Payout</p>
            </div>
            <button onClick={onClose} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-3xl font-black text-xl">BACK TO HOME</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;


import React, { useState, useEffect, useRef } from 'react';
import { User, GameType } from '../types';
import { GAMES, STAKE_OPTIONS } from '../constants';
import { generateAfrobeatsQuestions } from '../services/geminiService';
import LudoBoard from './LudoBoard';
import WhotGame from './WhotGame';
import QuizGame from './QuizGame';
import PlinkoGame from './PlinkoGame';
import AyoGame from './AyoGame';
import PredictGame from './PredictGame';
import SpinGame from './SpinGame';

interface GameContainerProps {
  gameId: string;
  user: User;
  isDark: boolean;
  onClose: () => void;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
}

const PLAYER_AVATARS = [
  { id: 'messi', url: 'https://unavatar.io/twitter/leomessisite', label: 'The GOAT' },
  { id: 'ronaldo', url: 'https://unavatar.io/twitter/cristiano', label: 'CR7' },
  { id: 'mbappe', url: 'https://unavatar.io/twitter/kmbappe', label: 'Speed' },
  { id: 'salah', url: 'https://unavatar.io/twitter/mosalah', label: 'Pharaoh' },
  { id: 'ninja', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Naruto', label: 'Shinobi' },
  { id: 'king', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero1', label: 'King' },
  { id: 'queen', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero4', label: 'Queen' },
  { id: 'eagle', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Eagle', label: 'Eagle' },
];

const BOARD_THEMES = [
  { id: 'wood', label: 'Royal Wood', icon: '🪵', class: 'board-theme-wood', color: 'bg-[#4b2c20]' },
  { id: 'marble', label: 'Imperial Marble', icon: '💎', class: 'board-theme-marble', color: 'bg-gray-900' },
  { id: 'cyber', label: 'Cyber Naija', icon: '⚡', class: 'board-theme-cyber', color: 'bg-blue-900' },
];

const GameContainer: React.FC<GameContainerProps> = ({ gameId, user, isDark, onClose, onWin, onLose }) => {
  const [gameState, setGameState] = useState<'mode_selection' | 'avatar_selection' | 'theme_selection' | 'stake_selection' | 'lobby' | 'playing' | 'result'>('mode_selection');
  const [multiplayerMode, setMultiplayerMode] = useState<'ai' | 'online' | 'local'>('ai');
  const [selectedStake, setSelectedStake] = useState<number>(500);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PLAYER_AVATARS[0].url);
  const [selectedTheme, setSelectedTheme] = useState<string>('wood');
  const [loading, setLoading] = useState(false);
  const [lobbyTime, setLobbyTime] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<'green' | 'blue'>('green');
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [winAmount, setWinAmount] = useState(0);

  const gameInfo = GAMES.find(g => g.id === gameId);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let interval: any;
    if (gameState === 'lobby') {
      if (multiplayerMode === 'online') {
        channel.current = new BroadcastChannel('money11_matchmaking');
        channel.current.postMessage({ type: 'DISCOVER_PLAYER', user: user.fullName, avatar: selectedAvatar });
        channel.current.onmessage = (event) => {
          if (event.data.type === 'DISCOVER_PLAYER' && !opponent) {
            setOpponent(event.data.user);
            setMyColor('green');
            channel.current?.postMessage({ type: 'PLAYER_FOUND', user: user.fullName, avatar: selectedAvatar });
          } else if (event.data.type === 'PLAYER_FOUND' && !opponent) {
            setOpponent(event.data.user);
            setMyColor('blue');
          }
        };
      }
      interval = setInterval(() => {
        setLobbyTime(prev => {
          if (prev >= 5 && !opponent && multiplayerMode === 'ai') setOpponent('AI Master');
          if (prev >= 8 && multiplayerMode === 'ai' && opponent) startGame();
          return prev + 1;
        });
      }, 1000);
    }
    return () => { clearInterval(interval); channel.current?.close(); };
  }, [gameState, opponent, multiplayerMode]);

  const selectMode = (mode: 'ai' | 'online' | 'local') => {
    setMultiplayerMode(mode);
    setGameState('avatar_selection');
  };

  const selectAvatar = (url: string) => {
    setSelectedAvatar(url);
    if (gameId === 'ludo') setGameState('theme_selection');
    else if (gameId === 'spin') startGame();
    else setGameState('stake_selection');
  };

  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setGameState('stake_selection');
  };

  const selectStake = (amount: number) => {
    if (user.balance < amount) { alert("Insufficient balance!"); return; }
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

  const handleWin = (bonus?: number) => {
    const total = bonus ? bonus : selectedStake * 2;
    setWinAmount(total);
    setGameState('result');
    onWin(total);
  };

  const handleLose = () => {
    setWinAmount(0);
    setGameState('result');
    onLose(selectedStake);
  };

  const renderCurrentGame = () => {
    switch(gameId) {
      case 'ludo': return <LudoBoard isDark={isDark} multiplayerMode={multiplayerMode} myColor={myColor} playerAvatar={selectedAvatar} theme={selectedTheme} onWin={handleWin} onLose={handleLose} />;
      case 'whot': return <WhotGame isDark={isDark} onWin={handleWin} onLose={handleLose} />;
      case 'music': return <QuizGame isDark={isDark} questions={questions} onWin={handleWin} onLose={handleLose} />;
      case 'plinko': return <PlinkoGame onWin={handleWin} onLose={handleLose} />;
      case 'ayo': return <AyoGame isDark={isDark} onWin={handleWin} onLose={handleLose} />;
      case 'predict': return <PredictGame isDark={isDark} onWin={handleWin} onLose={handleLose} />;
      case 'spin': return <SpinGame onWin={handleWin} />;
      default: return <div>Game coming soon!</div>;
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col animate-pop ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="text-3xl font-black bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
        <div className="text-center">
          <h2 className="font-black text-xl">{gameInfo?.name}</h2>
          <span className="bg-naija-green text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">PRO TOURNAMENT</span>
        </div>
        <div className="w-12 h-12 bg-naija-green/10 rounded-2xl flex items-center justify-center text-xl shadow-inner">{gameInfo?.icon}</div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {gameState === 'mode_selection' && (
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-black text-center">Choose Mode</h3>
            <button onClick={() => selectMode('ai')} className="w-full p-6 bg-white dark:bg-gray-800 rounded-3xl border-4 border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="font-black text-xl">vs AI (Practice)</span>
              <span>🤖</span>
            </button>
            <button onClick={() => selectMode('online')} className="w-full p-6 bg-white dark:bg-gray-800 rounded-3xl border-4 border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="font-black text-xl">Online Rival</span>
              <span>🌍</span>
            </button>
          </div>
        )}

        {gameState === 'avatar_selection' && (
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-black text-center">Select Avatar</h3>
            <div className="grid grid-cols-2 gap-4">
              {PLAYER_AVATARS.map(av => (
                <button key={av.id} onClick={() => selectAvatar(av.url)} className="p-4 bg-white dark:bg-gray-800 rounded-3xl border-4 border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 group hover:border-naija-green">
                  <img src={av.url} className="w-16 h-16 rounded-2xl" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'theme_selection' && (
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-black text-center">Select Theme</h3>
            {BOARD_THEMES.map(th => (
              <button key={th.id} onClick={() => selectTheme(th.id)} className={`w-full p-6 rounded-3xl border-4 ${th.color} text-white flex justify-between items-center`}>
                <span className="font-black text-xl">{th.label}</span>
                <span className="text-2xl">{th.icon}</span>
              </button>
            ))}
          </div>
        )}

        {gameState === 'stake_selection' && (
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-black text-center">Select Stake</h3>
            <div className="grid grid-cols-2 gap-4">
              {STAKE_OPTIONS.map(st => (
                <button key={st} onClick={() => selectStake(st)} className="p-6 bg-white dark:bg-gray-800 rounded-3xl border-4 border-naija-green text-naija-green font-black text-xl">₦{st}</button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'lobby' && (
          <div className="flex flex-col items-center justify-center p-12 space-y-8">
            <div className="w-24 h-24 border-8 border-naija-green border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-2xl font-black">{opponent ? `Matched with ${opponent}` : 'Searching for Rivals...'}</h3>
          </div>
        )}

        {gameState === 'playing' && renderCurrentGame()}

        {gameState === 'result' && (
          <div className="flex flex-col items-center justify-center p-12 space-y-8 animate-pop">
            <div className="text-9xl">{winAmount > 0 ? '🏆' : '💀'}</div>
            <div className="text-center">
              <h2 className="text-5xl font-black">₦{winAmount.toLocaleString()}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">{winAmount > 0 ? 'Total Payout' : 'Game Over'}</p>
            </div>
            <button onClick={onClose} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-3xl font-black text-xl shadow-2xl">BACK TO LOBBY</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;

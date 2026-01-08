
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

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
          const next = prev + 1;
          if (next >= 10 && !opponent && multiplayerMode === 'ai') {
            setOpponent('AI Master');
          }
          if (next >= 15 && multiplayerMode === 'ai' && opponent) {
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
    setGameState('avatar_selection');
  };

  const selectAvatar = (url: string) => {
    setSelectedAvatar(url);
    setGameState('theme_selection');
  };

  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
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
        <button onClick={() => selectMode('ai')} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border-4 border-gray-100 dark:border-gray-700 font-black text-xl flex items-center justify-between hover:border-naija-green transition-all shadow-sm">
          <span>Solo vs AI</span>
          <span className="text-2xl">🤖</span>
        </button>
        <button onClick={() => selectMode('online')} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border-4 border-gray-100 dark:border-gray-700 font-black text-xl flex items-center justify-between hover:border-naija-green transition-all shadow-sm">
          <div>
            <p>Online Multiplayer</p>
            <p className="text-[10px] text-naija-green font-bold uppercase">Match with real players</p>
          </div>
          <span className="text-2xl">🌍</span>
        </button>
      </div>
    </div>
  );

  const renderAvatarSelection = () => (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="text-center">
        <h3 className="text-2xl font-black mb-1">Select Avatar</h3>
        <p className="text-sm text-gray-500">Pick your tournament identity</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-12">
        {PLAYER_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => selectAvatar(avatar.url)}
            className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 group ${
              isDark ? 'bg-gray-800 border-gray-700 hover:border-naija-green' : 'bg-white border-gray-100 hover:border-naija-green'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-transparent group-hover:border-naija-green/30 transition-all shadow-lg">
              <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{avatar.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderThemeSelection = () => (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="text-center">
        <h3 className="text-2xl font-black mb-1">Select Arena Theme</h3>
        <p className="text-sm text-gray-500">Customize the board aesthetic</p>
      </div>
      <div className="grid grid-cols-1 gap-4 pb-12">
        {BOARD_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => selectTheme(theme.id)}
            className={`p-6 rounded-3xl border-4 transition-all flex items-center gap-6 group relative overflow-hidden ${
              isDark ? 'bg-gray-800 border-gray-700 hover:border-naija-green' : 'bg-white border-gray-100 hover:border-naija-green'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 ${theme.color}`}>
              {theme.icon}
            </div>
            <div className="text-left">
              <h4 className="font-black text-xl">{theme.label}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Aesthetic</p>
            </div>
            <div className="absolute right-[-10%] top-[-20%] text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
              {theme.icon}
            </div>
          </button>
        ))}
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
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300' 
                : 'bg-white dark:bg-gray-800 border-naija-green text-naija-green'
            }`}
          >
            ₦{amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLobby = () => {
    const theme = BOARD_THEMES.find(t => t.id === selectedTheme);
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6 text-center">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full border-8 border-t-transparent animate-spin ${selectedTheme === 'cyber' ? 'border-cyber-blue' : 'border-naija-green'}`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
               <img src={selectedAvatar} className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-black">{opponent ? 'Opponent Found!' : 'Matchmaking...'}</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{multiplayerMode === 'online' ? 'Searching for rivals' : 'Connecting to AI Squad'}</p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">You</span>
              <span className={`font-black ${selectedTheme === 'cyber' ? 'text-cyber-blue' : 'text-naija-green'}`}>VS</span>
              <span className="font-bold text-sm">{opponent || '???'}</span>
            </div>
          </div>
        </div>

        {opponent && (
          <button 
            onClick={startGame} 
            className={`w-full max-w-xs text-white py-5 rounded-3xl font-black text-xl animate-pulse shadow-lg uppercase transition-colors ${
              selectedTheme === 'cyber' ? 'bg-cyber-blue shadow-cyan-500/30' : 'bg-naija-green shadow-green-500/30'
            }`}
          >
            Enter {theme?.label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col animate-pop ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="text-3xl font-black bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
        <div className="text-center">
          <h2 className="font-black text-xl">{gameInfo?.name}</h2>
          <span className="bg-naija-green text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {multiplayerMode === 'online' ? 'LIVE TOURNAMENT' : 'TRAINING MODE'}
          </span>
        </div>
        <div className="w-12 h-12 bg-naija-green/10 rounded-2xl flex items-center justify-center text-xl shadow-inner">{gameInfo?.icon}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {gameState === 'mode_selection' && renderModeSelection()}
        {gameState === 'avatar_selection' && renderAvatarSelection()}
        {gameState === 'theme_selection' && renderThemeSelection()}
        {gameState === 'stake_selection' && renderStakeSelection()}
        {gameState === 'lobby' && renderLobby()}
        
        {gameState === 'playing' && gameId === 'ludo' && (
          <LudoBoard 
            isDark={isDark} 
            multiplayerMode={multiplayerMode}
            myColor={myColor}
            playerAvatar={selectedAvatar}
            theme={selectedTheme}
            onWin={() => finishGame(true)} 
            onLose={() => finishGame(false)} 
          />
        )}

        {gameState === 'playing' && gameId === 'music' && (
          <div className="p-6 text-center">
             <div className="text-6xl mb-4">🎵</div>
             <h3 className="text-xl font-bold">Music Quiz coming soon...</h3>
             <button onClick={onClose} className="mt-4 px-6 py-2 bg-naija-green text-white rounded-xl font-bold">Return Home</button>
          </div>
        )}

        {gameState === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6">
            <div className="text-9xl animate-bounce">{score >= 3 ? '🎉' : '💀'}</div>
            <div className="text-center">
              <h2 className="text-5xl font-black">₦{score >= 3 ? (selectedStake * 2).toLocaleString() : '0'}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">Naira Won</p>
            </div>
            <button onClick={onClose} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-3xl font-black text-xl shadow-2xl">BACK TO HOME</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;

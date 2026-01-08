
import React, { useState, useEffect } from 'react';
import { User, GameType } from '../types';
import { GAMES, STAKE_OPTIONS } from '../constants';
import { generateAfrobeatsQuestions } from '../services/geminiService';

interface GameContainerProps {
  gameId: string;
  user: User;
  isDark: boolean;
  onClose: () => void;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameId, user, isDark, onClose, onWin, onLose }) => {
  const [gameState, setGameState] = useState<'stake_selection' | 'lobby' | 'playing' | 'result'>('stake_selection');
  const [selectedStake, setSelectedStake] = useState<number>(500);
  const [loading, setLoading] = useState(false);
  const [lobbyTime, setLobbyTime] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  
  const gameInfo = GAMES.find(g => g.id === gameId);

  // Lobby Timer Logic
  useEffect(() => {
    let interval: any;
    if (gameState === 'lobby') {
      interval = setInterval(() => {
        setLobbyTime(prev => {
          const next = prev + 1;
          // Match logic
          if (next >= 30 && !opponent) {
            setOpponent('AI Master');
          }
          if (next >= 60) {
            clearInterval(interval);
            startGame();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, opponent]);

  const selectStake = (amount: number) => {
    if (user.balance < amount) {
      alert("Insufficient balance for this stake!");
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

  const handleQuizAnswer = (option: string) => {
    if (option === questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('result');
    // Win logic: double the stake if score is good
    const isWin = score >= 3; 
    if (isWin) onWin(selectedStake);
    else onLose(selectedStake);
  };

  const renderStakeSelection = () => (
    <div className="flex-1 flex flex-col p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-black mb-1">Select Your Stake</h3>
        <p className="text-sm text-gray-500">Winners double their money!</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {STAKE_OPTIONS.map(amount => (
          <button
            key={amount}
            onClick={() => selectStake(amount)}
            className={`p-6 rounded-3xl border-4 font-black text-xl transition-all toon-shadow active:translate-y-1 ${
              user.balance < amount 
                ? 'bg-gray-100 border-gray-200 text-gray-300' 
                : 'bg-white border-naija-green text-naija-green hover:bg-green-50'
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
        <div className={`w-32 h-32 rounded-full border-8 border-naija-green border-t-transparent animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-black">
          {60 - lobbyTime}s
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-black">
          {opponent ? 'Opponent Found!' : 'Searching for Players...'}
        </h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-inner border-2 border-dashed border-gray-200 w-full max-w-xs">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Match Details</p>
          <div className="mt-2 flex justify-between">
            <span className="font-bold">You</span>
            <span className="text-naija-green font-black">VS</span>
            <span className="font-bold">{opponent || '???'}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
        <div 
          className="bg-naija-green h-full transition-all duration-1000" 
          style={{ width: `${(lobbyTime / 60) * 100}%` }}
        ></div>
      </div>

      {opponent && (
        <button 
          onClick={startGame}
          className="w-full max-w-xs bg-naija-green text-white py-5 rounded-3xl font-black text-xl animate-bounce shadow-xl"
        >
          START MATCH
        </button>
      )}
      
      <p className="text-xs text-gray-500 italic">
        {lobbyTime < 30 
          ? 'Searching online pool...' 
          : 'Connecting to AI backup engine...'}
      </p>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col animate-pop ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center p-6">
        <button onClick={onClose} className="text-3xl font-black bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center">✕</button>
        <div className="text-center">
          <h2 className="font-black text-xl">{gameInfo?.name}</h2>
          <span className="bg-naija-green text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
            {gameState === 'playing' ? 'LIVE MATCH' : 'LOBBY'}
          </span>
        </div>
        <div className="w-12 h-12 bg-naija-green/10 rounded-2xl flex items-center justify-center text-xl">
          {gameInfo?.icon}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {gameState === 'stake_selection' && renderStakeSelection()}
        {gameState === 'lobby' && renderLobby()}
        
        {gameState === 'playing' && gameId === 'music' && (
          <div className="p-6 flex flex-col justify-center space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-b-8 border-naija-green">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-naija-green mb-4">
                 <span>Round {currentQuestion + 1}/5</span>
                 <span>Score: {score}</span>
               </div>
               <h3 className="text-2xl font-black leading-tight">{questions[currentQuestion]?.question}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion]?.options.map((opt: string) => (
                <button 
                  key={opt}
                  onClick={() => handleQuizAnswer(opt)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl font-black text-left border-4 border-gray-100 dark:border-gray-700 hover:border-naija-green hover:bg-green-50 transition-all toon-shadow active:translate-y-1 text-lg"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'playing' && gameId !== 'music' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
             <div className="text-8xl animate-bounce">🎲</div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black">Playing against {opponent}</h3>
               <p className="text-gray-500">The first player to reach the goal wins the stake!</p>
             </div>
             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-blue-500 p-4 rounded-2xl text-white font-black">YOU: Active</div>
                <div className="bg-red-500 p-4 rounded-2xl text-white font-black">AI: Thinking...</div>
             </div>
             <button onClick={finishGame} className="bg-naija-green text-white px-8 py-4 rounded-3xl font-black">SIMULATE WIN (DEBUG)</button>
          </div>
        )}

        {gameState === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6">
            <div className="relative">
              <div className="text-9xl animate-bounce">{score >= 3 ? '🎉' : '💀'}</div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg border-2 border-naija-green font-black whitespace-nowrap">
                {score >= 3 ? 'BIG WIN!' : 'BETTER LUCK'}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-5xl font-black tracking-tighter">₦{score >= 3 ? (selectedStake * 2).toLocaleString() : '0'}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">Total Earnings</p>
            </div>
            <button onClick={onClose} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-3xl font-black text-xl toon-shadow">RETURN TO MENU</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;

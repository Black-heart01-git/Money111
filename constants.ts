
import { GameType } from './types';

export const COLORS = {
  green: '#008751',
  white: '#FFFFFF',
  darkGreen: '#006B40',
  accent: '#FFD700', // Gold
};

export const GAMES = [
  {
    id: 'ludo',
    name: GameType.LUDO,
    description: 'Player vs AI / Multiplayer classic',
    icon: '🎲',
    color: 'bg-blue-500',
    minEntry: 100
  },
  {
    id: 'whot',
    name: GameType.WHOT,
    description: 'The ultimate Nigerian card game',
    icon: '🃏',
    color: 'bg-red-500',
    minEntry: 200
  },
  {
    id: 'music',
    name: GameType.MUSIC,
    description: 'Listen and answer correctly to win',
    icon: '🎵',
    color: 'bg-purple-500',
    minEntry: 50
  },
  {
    id: 'plinko',
    name: GameType.PLINKO,
    description: 'Drop the ball, win Naira prizes',
    icon: '💰',
    color: 'bg-green-600',
    minEntry: 50
  },
  {
    id: 'predict',
    name: GameType.PREDICT,
    description: 'Premier League predictions',
    icon: '⚽',
    color: 'bg-indigo-600',
    minEntry: 500
  },
  {
    id: 'ayo',
    name: GameType.AYO,
    description: 'Traditional board game mastery',
    icon: '🕳️',
    color: 'bg-orange-600',
    minEntry: 100
  },
  {
    id: 'spin',
    name: GameType.SPIN,
    description: 'Your daily chance to win big',
    icon: '🎡',
    color: 'bg-pink-500',
    minEntry: 0
  }
];

export const WITHDRAWAL_LIMITS = {
  tier1: { daily: 5000, deposit: 10000 },
  tier2: { daily: 20000, deposit: 50000 },
  minWithdrawal: 500
};

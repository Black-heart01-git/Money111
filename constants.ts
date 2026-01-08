
import { GameType, AccountTier } from './types';

export const COLORS = {
  green: '#008751',
  white: '#FFFFFF',
  darkGreen: '#006B40',
  accent: '#FFD700', // Gold
};

export const STAKE_OPTIONS = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000];

export const GAMES = [
  {
    id: 'ludo',
    name: GameType.LUDO,
    description: 'Player vs AI / Multiplayer classic',
    icon: '🎲',
    color: 'bg-blue-500',
    minEntry: 500
  },
  {
    id: 'whot',
    name: GameType.WHOT,
    description: 'The ultimate Nigerian card game',
    icon: '🃏',
    color: 'bg-red-500',
    minEntry: 500
  },
  {
    id: 'music',
    name: GameType.MUSIC,
    description: 'Listen and answer correctly to win',
    icon: '🎵',
    color: 'bg-purple-500',
    minEntry: 500
  },
  {
    id: 'plinko',
    name: GameType.PLINKO,
    description: 'Drop the ball, win Naira prizes',
    icon: '💰',
    color: 'bg-green-600',
    minEntry: 500
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
    minEntry: 500
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

export const TIER_CONFIG: Record<AccountTier, { price: number; dailyLimit: number }> = {
  'Starter': { price: 7500, dailyLimit: 15000 },
  'Premium': { price: 13000, dailyLimit: 50000 },
  'Pro': { price: 17000, dailyLimit: 150000 }
};

export const WITHDRAWAL_LIMITS = {
  minWithdrawal: 500
};

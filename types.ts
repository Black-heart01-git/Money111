
export enum GameType {
  LUDO = 'Ludo Supreme',
  WHOT = 'Whot! Championship',
  MUSIC = 'Afrobeats Quiz',
  PLINKO = 'Naija Drop',
  PREDICT = 'Predict & Win',
  AYO = 'Ayo Olopon',
  SPIN = 'Spin to Win'
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  balance: number;
  tier: 1 | 2;
  referralCode: string;
  isGuest: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'game_win' | 'game_entry' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  method: string;
}

export interface GameStats {
  played: number;
  won: number;
  earnings: number;
}

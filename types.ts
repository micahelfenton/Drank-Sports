
export type Sport = 'Basketball' | 'Rugby' | 'Soccer' | 'Golf';
export type GameMode = 'Drinking' | 'Kids';
export type TargetType = 'Random' | 'Everyone' | 'Last to React' | 'Specific' | 'None';

export interface Rule {
  id: string;
  label: string;
  action: string;
  value: number;
  unit: string;
  target: TargetType;
  enabled: boolean;
  countdown?: number; // seconds
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  penalty: string;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  isHost: boolean;
  lastReactionTime?: number;
}

export interface Room {
  code: string;
  sport: Sport;
  mode: GameMode;
  status: 'lobby' | 'config' | 'playing' | 'ended';
  rules: Rule[];
  players: Player[];
  activeEvent?: {
    ruleId: string;
    startTime: number;
    challengeType: 'SHAPES' | 'QUIZ';
    safetyLog: Record<string, number>; // playerId -> tapTime
    resultsShown?: boolean;
  };
  activeQuiz?: {
    id: string;
    startTime: number;
    answers: Record<string, number>; // playerId -> optionIndex
  };
}

export interface RulePack {
  id: string;
  name: string;
  sport: Sport;
  mode: GameMode;
  rules: Rule[];
  isCommunity?: boolean;
}

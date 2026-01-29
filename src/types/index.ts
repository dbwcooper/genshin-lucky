export interface Participant {
  id: string;
  name: string;
  dept?: string;
}

export type PrizePoolId = 'first' | 'second' | 'third' | 'fourth' | 'lucky';

export interface PrizePool {
  id: PrizePoolId;
  name: string;
  maxWinners: number;
  color: string;
  isLucky: boolean;
}

export interface Winner {
  participant: Participant;
  wonAt: string;
}

export interface DrawRecord {
  id: string;
  eventDate: string;
  poolId: PrizePoolId;
  poolName: string;
  roundNumber: number;
  prizeName: string;
  winners: Winner[];
  createdAt: string;
}

export type DrawPhase =
  | 'idle'
  | 'meteor'
  | 'portal'
  | 'landing'
  | 'revealing'
  | 'result'
  | 'skipped';

export interface DrawState {
  phase: DrawPhase;
  poolId: PrizePoolId | null;
  targetCount: number;
  actualCount: number;
  winners: Winner[];
  currentRevealIndex: number;
  shouldConfirm: boolean;
  confirmReason?: string;
}

export interface AppConfig {
  eventDate: string;
  pools: PrizePool[];
}

export interface DrawResult {
  winners: Participant[];
  actualCount: number;
  shouldConfirm: boolean;
  reason?: string;
}

export interface DrawContextType {
  participants: Participant[];
  history: DrawRecord[];
  currentPool: PrizePoolId;
  requestCount: number;
}

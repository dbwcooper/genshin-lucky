import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { DrawState, DrawPhase, PrizePoolId, Winner, Participant } from '@/types';
import { executeDraw } from '@/lib/drawRules';
import { db } from '@/db/dexie';

interface DrawContextValue {
  state: DrawState;
  startDraw: (poolId: PrizePoolId, count: number, participants: Participant[]) => Promise<void>;
  skipAnimation: () => void;
  confirmReducedCount: () => void;
  nextPhase: () => void;
  revealNextCard: () => void;
  completeDraw: () => Promise<void>;
  resetDraw: () => void;
}

const initialState: DrawState = {
  phase: 'idle',
  poolId: null,
  targetCount: 0,
  actualCount: 0,
  winners: [],
  currentRevealIndex: -1,
  shouldConfirm: false,
};

type DrawAction =
  | { type: 'START_DRAW'; payload: { poolId: PrizePoolId; targetCount: number; actualCount: number; winners: Winner[]; shouldConfirm: boolean; confirmReason?: string } }
  | { type: 'CONFIRM_REDUCED' }
  | { type: 'SET_PHASE'; payload: DrawPhase }
  | { type: 'REVEAL_NEXT' }
  | { type: 'SKIP_ANIMATION' }
  | { type: 'RESET' };

function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case 'START_DRAW':
      return {
        ...state,
        phase: action.payload.shouldConfirm ? 'idle' : 'meteor',
        poolId: action.payload.poolId,
        targetCount: action.payload.targetCount,
        actualCount: action.payload.actualCount,
        winners: action.payload.winners,
        currentRevealIndex: -1,
        shouldConfirm: action.payload.shouldConfirm,
        confirmReason: action.payload.confirmReason,
      };
    case 'CONFIRM_REDUCED':
      return { ...state, phase: 'meteor', shouldConfirm: false };
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'REVEAL_NEXT':
      return { ...state, currentRevealIndex: state.currentRevealIndex + 1 };
    case 'SKIP_ANIMATION':
      return { ...state, phase: 'result', currentRevealIndex: state.winners.length - 1 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const DrawContext = createContext<DrawContextValue | null>(null);

export function DrawProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(drawReducer, initialState);

  const startDraw = useCallback(
    async (poolId: PrizePoolId, count: number, participants: Participant[]) => {
      const history = await db.drawRecords.toArray();
      const result = executeDraw({
        participants,
        history,
        currentPool: poolId,
        requestCount: count,
      });

      const winners: Winner[] = result.winners.map((p) => ({
        participant: p,
        wonAt: new Date().toISOString(),
      }));

      dispatch({
        type: 'START_DRAW',
        payload: {
          poolId,
          targetCount: count,
          actualCount: result.actualCount,
          winners,
          shouldConfirm: result.shouldConfirm,
          confirmReason: result.reason,
        },
      });
    },
    []
  );

  const skipAnimation = useCallback(() => {
    dispatch({ type: 'SKIP_ANIMATION' });
  }, []);

  const confirmReducedCount = useCallback(() => {
    dispatch({ type: 'CONFIRM_REDUCED' });
  }, []);

  const nextPhase = useCallback(() => {
    const phaseOrder: DrawPhase[] = ['meteor', 'portal', 'landing', 'revealing', 'result'];
    const currentIndex = phaseOrder.indexOf(state.phase);
    if (currentIndex < phaseOrder.length - 1) {
      dispatch({ type: 'SET_PHASE', payload: phaseOrder[currentIndex + 1] });
    }
  }, [state.phase]);

  const revealNextCard = useCallback(() => {
    if (state.currentRevealIndex < state.winners.length - 1) {
      dispatch({ type: 'REVEAL_NEXT' });
    } else {
      dispatch({ type: 'SET_PHASE', payload: 'result' });
    }
  }, [state.currentRevealIndex, state.winners.length]);

  const completeDraw = useCallback(async () => {
    if (!state.poolId || state.winners.length === 0) return;

    const roundNumber = await db.getNextRoundNumber(state.poolId);
    const poolNames: Record<PrizePoolId, string> = {
      first: '一等奖',
      second: '二等奖',
      third: '三等奖',
      fourth: '四等奖',
      lucky: '幸运奖',
    };

    const record = {
      id: crypto.randomUUID(),
      eventDate: new Date().toISOString().split('T')[0],
      poolId: state.poolId,
      poolName: poolNames[state.poolId],
      roundNumber,
      prizeName: poolNames[state.poolId],
      winners: state.winners,
      createdAt: new Date().toISOString(),
    };

    await db.drawRecords.add(record);
  }, [state.poolId, state.winners]);

  const resetDraw = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <DrawContext.Provider
      value={{
        state,
        startDraw,
        skipAnimation,
        confirmReducedCount,
        nextPhase,
        revealNextCard,
        completeDraw,
        resetDraw,
      }}
    >
      {children}
    </DrawContext.Provider>
  );
}

export function useDraw() {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error('useDraw must be used within DrawProvider');
  }
  return context;
}

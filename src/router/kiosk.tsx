import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { DrawProvider, useDraw } from '@/features/draw/components/DrawProvider';
import { usePools } from '@/features/pools/components/PoolProvider';
import { useKioskExit, useReducedMotion } from '@/features/kiosk/hooks/useKioskMode';
import type { PrizePoolId } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SkipForward, X } from 'lucide-react';

interface KioskSearch {
  pool: PrizePoolId;
}

export const Route = createFileRoute('/kiosk')({
  component: KioskPageWrapper,
  validateSearch: (search: Record<string, unknown>): KioskSearch => ({
    pool: (search.pool as PrizePoolId) || 'lucky',
  }),
});

function KioskPageWrapper() {
  return (
    <DrawProvider>
      <KioskPage />
    </DrawProvider>
  );
}

function KioskPage() {
  const navigate = useNavigate();
  const { pool } = useSearch({ from: '/kiosk' });
  const { pools, participants } = usePools();
  const { state, startDraw, skipAnimation, confirmReducedCount, nextPhase, revealNextCard, completeDraw, resetDraw } = useDraw();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const reducedMotion = useReducedMotion();

  const currentPool = pools.find((p) => p.id === pool);
  const maxCount = currentPool ? currentPool.maxWinners : 10;

  useKioskExit(() => {
    navigate({ to: '/' });
  });

  useEffect(() => {
    if (state.shouldConfirm) {
      setShowConfirmDialog(true);
    }
  }, [state.shouldConfirm]);

  const handleStartDraw = useCallback(async () => {
    const count = Math.min(maxCount, 10);
    await startDraw(pool, count, participants);
  }, [pool, maxCount, participants, startDraw]);

  const handleConfirmContinue = useCallback(() => {
    confirmReducedCount();
    setShowConfirmDialog(false);
  }, [confirmReducedCount]);

  const handleSkip = useCallback(() => {
    skipAnimation();
  }, [skipAnimation]);

  const handleReset = useCallback(() => {
    resetDraw();
  }, [resetDraw]);

  if (!currentPool) {
    return <div>Invalid pool</div>;
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, ${currentPool.color}20 100%)` }}
    >
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => navigate({ to: '/' })}
      >
        <X className="w-6 h-6" />
      </Button>

      {state.phase === 'idle' && (
        <div className="text-center">
          <h1 
            className="text-6xl font-bold mb-8"
            style={{ color: currentPool.color }}
          >
            {currentPool.name}
          </h1>
          <p className="text-white/60 mb-8 text-xl">
            本轮将抽取 {Math.min(maxCount, 10)} 人
          </p>
          <Button
            size="lg"
            className="text-2xl px-12 py-6"
            style={{ backgroundColor: currentPool.color }}
            onClick={handleStartDraw}
          >
            开始抽奖
          </Button>
        </div>
      )}

      {state.phase === 'meteor' && (
        <MeteorPhase 
          poolColor={currentPool.color}
          reducedMotion={reducedMotion}
          onComplete={nextPhase}
        />
      )}

      {state.phase === 'portal' && (
        <PortalPhase
          poolColor={currentPool.color}
          reducedMotion={reducedMotion}
          onComplete={nextPhase}
        />
      )}

      {state.phase === 'landing' && (
        <LandingPhase
          poolColor={currentPool.color}
          reducedMotion={reducedMotion}
          onComplete={nextPhase}
        />
      )}

      {state.phase === 'revealing' && (
        <RevealingPhase
          winners={state.winners}
          currentIndex={state.currentRevealIndex}
          poolColor={currentPool.color}
          reducedMotion={reducedMotion}
          onReveal={revealNextCard}
        />
      )}

      {(state.phase === 'result' || state.phase === 'skipped') && (
        <ResultPhase
          winners={state.winners}
          poolName={currentPool.name}
          poolColor={currentPool.color}
          onReset={handleReset}
        />
      )}

      {state.phase !== 'idle' && state.phase !== 'result' && state.phase !== 'skipped' && (
        <Button
          variant="ghost"
          className="absolute bottom-8 right-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={handleSkip}
        >
          <SkipForward className="w-5 h-5 mr-2" />
          跳过
        </Button>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>人数不足</DialogTitle>
            <DialogDescription className="text-slate-400">
              {state.confirmReason}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              返回
            </Button>
            <Button onClick={handleConfirmContinue} style={{ backgroundColor: currentPool.color }}>
              继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MeteorPhase({ poolColor, reducedMotion, onComplete }: { poolColor: string; reducedMotion: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  if (reducedMotion) return null;

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${poolColor}40 0%, transparent 50%)`,
        }}
      />
      <div className="text-8xl font-bold text-white animate-bounce">
        ✨
      </div>
    </div>
  );
}

function PortalPhase({ poolColor, reducedMotion, onComplete }: { poolColor: string; reducedMotion: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  if (reducedMotion) return null;

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div 
        className="w-32 h-32 rounded-full animate-spin"
        style={{
          background: `conic-gradient(from 0deg, ${poolColor}, transparent, ${poolColor})`,
          boxShadow: `0 0 60px ${poolColor}`,
        }}
      />
    </div>
  );
}

function LandingPhase({ poolColor, reducedMotion, onComplete }: { poolColor: string; reducedMotion: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  if (reducedMotion) return null;

  return (
    <div className="flex items-center justify-center">
      <div 
        className="w-24 h-36 rounded-lg animate-bounce"
        style={{ backgroundColor: poolColor }}
      />
    </div>
  );
}

function RevealingPhase({ 
  winners, 
  currentIndex, 
  poolColor, 
  reducedMotion,
  onReveal 
}: { 
  winners: { participant: { name: string; id: string } }[];
  currentIndex: number;
  poolColor: string;
  reducedMotion: boolean;
  onReveal: () => void;
}) {
  useEffect(() => {
    if (currentIndex === -1) {
      const timer = setTimeout(onReveal, 500);
      return () => clearTimeout(timer);
    }
    if (currentIndex < winners.length - 1 && !reducedMotion) {
      const timer = setTimeout(onReveal, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, winners.length, reducedMotion, onReveal]);

  return (
    <div className="grid grid-cols-5 gap-4 p-8">
      {winners.map((winner, index) => (
        <div
          key={winner.participant.id}
          className={`w-32 h-48 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-500 ${
            index <= currentIndex 
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 scale-100' 
              : 'bg-slate-700 scale-95'
          }`}
        >
          {index <= currentIndex ? winner.participant.name : '?'}
        </div>
      ))}
    </div>
  );
}

function ResultPhase({ 
  winners, 
  poolName, 
  poolColor, 
  onReset 
}: { 
  winners: { participant: { name: string; dept?: string } }[];
  poolName: string;
  poolColor: string;
  onReset: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-8">{poolName} 中奖名单</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {winners.map((winner, index) => (
          <div
            key={index}
            className="p-6 rounded-lg text-white"
            style={{ backgroundColor: poolColor }}
          >
            <p className="text-2xl font-bold">{winner.participant.name}</p>
            {winner.participant.dept && (
              <p className="text-sm opacity-80">{winner.participant.dept}</p>
            )}
          </div>
        ))}
      </div>
      <Button
        size="lg"
        onClick={onReset}
        style={{ backgroundColor: poolColor }}
      >
        再抽一轮
      </Button>
    </div>
  );
}

import type { Participant, PrizePoolId, DrawRecord, DrawResult } from '@/types';

interface DrawContext {
  participants: Participant[];
  history: DrawRecord[];
  currentPool: PrizePoolId;
  requestCount: number;
}

export function executeDraw(ctx: DrawContext): DrawResult {
  const { participants, history, currentPool, requestCount } = ctx;

  const regularWinners = new Set<string>();
  const luckyWinners = new Set<string>();

  for (const record of history) {
    for (const w of record.winners) {
      if (record.poolId === 'lucky') {
        luckyWinners.add(w.participant.id);
      } else {
        regularWinners.add(w.participant.id);
      }
    }
  }

  let available: Participant[];

  if (currentPool === 'lucky') {
    // 幸运奖：只排除已中过幸运奖的人，允许1-4等奖得主再中
    available = participants.filter((p) => !luckyWinners.has(p.id));
  } else {
    // 1-4等奖：只排除已中过1-4等奖的人（互斥）
    available = participants.filter((p) => !regularWinners.has(p.id));
  }

  const actualCount = Math.min(requestCount, available.length);
  const shouldConfirm = actualCount < requestCount;

  if (available.length === 0) {
    return {
      winners: [],
      actualCount: 0,
      shouldConfirm: true,
      reason: '无可抽取人员',
    };
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, actualCount);

  return {
    winners,
    actualCount,
    shouldConfirm,
    reason: shouldConfirm
      ? `人数不足，从 ${requestCount} 缩减为 ${actualCount}`
      : undefined,
  };
}

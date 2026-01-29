import Dexie, { type Table } from 'dexie';
import type { DrawRecord, Participant, AppConfig } from '@/types';

export class LotteryDB extends Dexie {
  drawRecords!: Table<DrawRecord, string>;
  participants!: Table<Participant, string>;

  constructor() {
    super('LotteryDB');
    this.version(1).stores({
      drawRecords: 'id, poolId, roundNumber, eventDate, createdAt',
      participants: 'id, name',
    });
  }

  async getNextRoundNumber(poolId: string): Promise<number> {
    const records = await this.drawRecords
      .where('poolId')
      .equals(poolId)
      .sortBy('roundNumber');
    return records.length > 0
      ? records[records.length - 1].roundNumber + 1
      : 1;
  }

  async exportByPool(poolId: string): Promise<DrawRecord[]> {
    return this.drawRecords
      .where('poolId')
      .equals(poolId)
      .sortBy('roundNumber');
  }

  async clearHistory(): Promise<void> {
    await this.drawRecords.clear();
  }
}

export const db = new LotteryDB();

const CONFIG_KEY = 'lottery:config:v1';

export const storage = {
  getConfig(): AppConfig | null {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setConfig(config: AppConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },
  clearConfig(): void {
    localStorage.removeItem(CONFIG_KEY);
  },
};

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DrawRecord, PrizePoolId } from '@/types';
import { db } from '@/db/dexie';

interface HistoryContextValue {
  records: DrawRecord[];
  loadRecords: () => Promise<void>;
  exportRound: (record: DrawRecord) => void;
  exportAllByPool: (poolId: PrizePoolId) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DrawRecord[]>([]);

  const loadRecords = useCallback(async () => {
    const allRecords = await db.drawRecords.toArray();
    setRecords(allRecords.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);

  const exportRound = useCallback((record: DrawRecord) => {
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const date = record.eventDate;
    const filename = `年会${date}_${record.poolName}_第${record.roundNumber}轮.json`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportAllByPool = useCallback(async (poolId: PrizePoolId) => {
    const poolRecords = await db.exportByPool(poolId);
    const dataStr = JSON.stringify(poolRecords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const date = new Date().toISOString().split('T')[0];
    const poolName = poolRecords[0]?.poolName || poolId;
    const filename = `年会${date}_${poolName}_全部记录.json`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const clearHistory = useCallback(async () => {
    await db.clearHistory();
    setRecords([]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        records,
        loadRecords,
        exportRound,
        exportAllByPool,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
}

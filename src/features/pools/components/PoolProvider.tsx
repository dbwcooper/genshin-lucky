import React, { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import type { PrizePool, PrizePoolId, Participant } from '@/types';
import { storage } from '@/db/dexie';

const defaultPools: PrizePool[] = [
  { id: 'first', name: '一等奖', maxWinners: 1, color: '#FFD700', isLucky: false },
  { id: 'second', name: '二等奖', maxWinners: 2, color: '#C0C0C0', isLucky: false },
  { id: 'third', name: '三等奖', maxWinners: 3, color: '#CD7F32', isLucky: false },
  { id: 'fourth', name: '四等奖', maxWinners: 5, color: '#00a758', isLucky: false },
  { id: 'lucky', name: '幸运奖', maxWinners: 10, color: '#FF6B6B', isLucky: true },
];

interface PoolContextValue {
  pools: PrizePool[];
  participants: Participant[];
  loadParticipants: () => Promise<void>;
  updatePool: (pool: PrizePool) => void;
}

const PoolContext = createContext<PoolContextValue | null>(null);

export function PoolProvider({ children }: { children: ReactNode }) {
  const [pools, setPools] = useState<PrizePool[]>(() => {
    const config = storage.getConfig();
    return config?.pools || defaultPools;
  });
  
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = useCallback(async () => {
    try {
      const response = await fetch('/assets/data/participants.json');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
      setParticipants([]);
    }
  }, []);

  const updatePool = useCallback((pool: PrizePool) => {
    setPools((prev) => {
      const updated = prev.map((p) => (p.id === pool.id ? pool : p));
      const config = storage.getConfig();
      storage.setConfig({ 
        ...config, 
        pools: updated, 
        eventDate: config?.eventDate || new Date().toISOString().split('T')[0] 
      });
      return updated;
    });
  }, []);

  return (
    <PoolContext.Provider
      value={{
        pools,
        participants,
        loadParticipants,
        updatePool,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
}

export function usePools() {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error('usePools must be used within PoolProvider');
  }
  return context;
}

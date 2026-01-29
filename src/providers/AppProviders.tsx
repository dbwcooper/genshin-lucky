import { ReactNode } from 'react';
import { PoolProvider } from '@/features/pools/components/PoolProvider';
import { HistoryProvider } from '@/features/history/components/HistoryProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PoolProvider>
      <HistoryProvider>
        {children}
      </HistoryProvider>
    </PoolProvider>
  );
}

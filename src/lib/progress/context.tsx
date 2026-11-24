import { createContext, useMemo, type ReactNode } from 'react';
import { createProgressStore, type ProgressStore } from './store';

export const ProgressContext = createContext<ProgressStore | null>(null);

export function ProgressProvider({ store, children }: { store?: ProgressStore; children: ReactNode }) {
  const value = useMemo(() => store ?? createProgressStore(), [store]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

import { useCallback, useSyncExternalStore } from 'react';

/** true si la media query coincide. Sin matchMedia (tests, SSR) devuelve false. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  return useSyncExternalStore(subscribe, get, () => false);
}

export const MOBILE_QUERY = '(max-width: 760px)';

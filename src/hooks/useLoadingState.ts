import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialState: LoadingState = {}): { loadingStates: LoadingState; setLoading: (key: string, isLoading: boolean) => void; isLoading: (key: string) => boolean; isAnyLoading: () => boolean; withLoading: <T extends unknown[], R>(key: string, fn: (...args: T) => Promise<R>) => (...args: T) => Promise<R>; resetLoading: () => void } => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const withLoading = useCallback(
    <T extends unknown[], R>(
      key: string,
      fn: (...args: T) => Promise<R>
    ) => {
      return async (...args: T): Promise<R> => {
        setLoading(key, true);
        try {
          const result = await fn(...args);
          return result;
        } finally {
          setLoading(key, false);
        }
      };
    },
    [setLoading]
  );

  const resetLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    resetLoading,
  };
};

export default useLoadingState;
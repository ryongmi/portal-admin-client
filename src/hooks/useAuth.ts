import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

export const useAuth = (): {
  user: { id: string; email?: string; name?: string; } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
} => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
  };
};

export default useAuth;
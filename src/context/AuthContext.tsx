'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useAuthInitialize, useMyProfile } from '@/hooks/queries/auth';
import { useLogout } from '@/hooks/mutations/auth';
import { queryKeys } from '@/hooks/queries/keys';
import type { UserProfile } from '@krgeobuk/user/interfaces';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const queryClient = useQueryClient();
  const { setAuthenticated, setInitialized, clearAuth, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const initQuery = useAuthInitialize();
  const profileQuery = useMyProfile();

  // 초기화 결과에 따라 Zustand 상태 업데이트
  useEffect(() => {
    if (initQuery.isSuccess) {
      const { isLogin, user } = initQuery.data;
      setAuthenticated(!!(isLogin && user));
      setInitialized(true);
    } else if (initQuery.isError) {
      setAuthenticated(false);
      setInitialized(true);
    }
  }, [initQuery.isSuccess, initQuery.isError, initQuery.data, setAuthenticated, setInitialized]);

  // 토큰 강제 만료 이벤트 처리
  useEffect(() => {
    const handleTokenCleared = (): void => clearAuth();
    window.addEventListener('tokenCleared', handleTokenCleared);
    return (): void => window.removeEventListener('tokenCleared', handleTokenCleared);
  }, [clearAuth]);

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.myProfile() });
  };

  // profileQuery 우선, 없으면 initQuery 데이터 사용
  const user = profileQuery.data ?? initQuery.data?.user ?? null;

  const value: AuthContextType = {
    user,
    loading: initQuery.isPending,
    isLoggedIn: isAuthenticated,
    error: initQuery.error ? String(initQuery.error) : null,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, fetchUserProfile, initializeAuth, clearUser } from "@/store/slices/authSlice";
import { tokenManager } from "@/lib/httpClient";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, isInitialized } = useAppSelector((state) => state.auth);
  const initializeRef = useRef(false);

  // 초기 인증 상태 확인 (쿠키 기반)
  useEffect(() => {
    const checkInitialAuth = async (): Promise<void> => {
      // 이미 초기화되었거나 진행 중이면 스킵 (StrictMode 대응)
      if (isInitialized || isLoading || initializeRef.current) {
        return;
      }

      initializeRef.current = true;

      try {
        await dispatch(initializeAuth()).unwrap();
      } catch (_error) {
        // 인증되지 않은 사용자
      } finally {
        // 초기화 완료 후 플래그 해제
        initializeRef.current = false;
      }
    };

    // TokenManager 이벤트 리스너 설정
    const handleTokenCleared = (): void => {
      dispatch(clearUser());
    };

    const handleTokenUpdated = (event: CustomEvent): void => {
      // 새 토큰이 설정되면 사용자 정보 갱신
      if (event.detail?.accessToken && !user) {
        dispatch(fetchUserProfile());
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('tokenCleared', handleTokenCleared);
    window.addEventListener('tokenUpdated', handleTokenUpdated as EventListener);

    // 초기 인증 확인
    checkInitialAuth();

    return (): void => {
      window.removeEventListener('tokenCleared', handleTokenCleared);
      window.removeEventListener('tokenUpdated', handleTokenUpdated as EventListener);
    };
  }, [dispatch, isInitialized, isLoading, user]);

  // 로그아웃
  const logout = async (): Promise<void> => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (_error) {
      // 로그아웃 실패 오류 로그
      // 로그아웃 실패해도 클라이언트 상태는 초기화
      dispatch(clearUser());
      tokenManager.clearAccessToken();
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async (): Promise<void> => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (_error) {
      // 사용자 정보 새로고침 실패 오류 로그
    }
  };

  const value: AuthContextType = {
    user,
    loading: isLoading,
    isLoggedIn: isAuthenticated,
    error,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
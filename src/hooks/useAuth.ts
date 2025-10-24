/**
 * useAuth Hook - Redux 기반 인증 상태 관리
 *
 * portal-client 패턴을 따르는 인증 Hook입니다.
 * Redux authSlice를 래핑하여 컴포넌트에서 쉽게 사용할 수 있도록 합니다.
 *
 * 특징:
 * - Redux 상태만 조회 (Single Source of Truth)
 * - initializeAuth() 자동 실행 (RefreshToken 기반 자동 복원)
 * - 서비스 직접 호출 없음 (Redux Slice를 통해서만 API 호출)
 *
 * 사용 예시:
 * ```typescript
 * const { user, isAuthenticated, isLoading } = useAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthenticated) return <LoginPage />;
 *
 * return <div>Welcome, {user?.name}</div>;
 * ```
 *
 * @see portal-client/src/hooks/useAuth.ts - 참조 구현
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

export const useAuth = (): {
  user: { id: string; email?: string; name?: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
} => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // 초기화되지 않은 경우 자동으로 인증 초기화 실행
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
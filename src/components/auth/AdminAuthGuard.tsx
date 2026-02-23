'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { hasAdminRole } from '@/utils/roleUtils';

interface AdminAuthGuardProps {
  children: ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isInitialized } = useAuthStore();

  useEffect(() => {
    // 로딩 중일 때는 아무것도 하지 않음
    if (isLoading) return;

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      const currentUrl = window.location.href;
      const redirectUri = encodeURIComponent(currentUrl);
      const loginUrl = `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/auth/login?redirect_uri=${redirectUri}`;

      window.location.href = loginUrl;
      return;
    }

    // 관리자 권한 체크
    if (isAuthenticated && user && !hasAdminRole(user)) {
      // 권한이 없는 사용자는 일반 포털로 리다이렉트
      window.location.href = process.env.NEXT_PUBLIC_PORTAL_CLIENT_URL || 'http://localhost:3200';
      return;
    }
  }, [isAuthenticated, user, isLoading]);

  // 초기화 전이거나 로딩 중이거나 인증되지 않은 상태에서는 로딩 화면 표시
  if (!isInitialized || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 인증된 사용자이지만 관리자 권한이 없는 경우
  if (isAuthenticated && user && !hasAdminRole(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 mx-auto mb-6 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">
            관리자 권한이 필요한 페이지입니다. 일반 사용자 포털로 이동합니다.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;

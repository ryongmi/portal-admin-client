import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import type { UserProfile } from '@krgeobuk/user/interfaces';

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasGoogleAuth: boolean;
  hasNaverAuth: boolean;
  isHomepageUser: boolean;
  availableServices: UserProfile['availableServices'];
  roles: string[];
  permissions: string[];
}

/**
 * 통합 사용자 프로필 관리 훅
 * - OAuth 정보, 권한 정보, 서비스 목록을 포함한 완전한 사용자 프로필
 * - 구글/네이버 인증 상태 확인 유틸리티 제공
 * - 접근 가능한 서비스 목록 제공
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getMyProfile();
      setUserProfile(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '사용자 프로필을 불러오는데 실패했습니다.';
      setError(errorMessage);
      // Error logged for debugging
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 편의 함수들
  const hasGoogleAuthValue = userProfile ? userProfile.oauthAccount.provider === 'google' : false;
  const hasNaverAuthValue = userProfile ? userProfile.oauthAccount.provider === 'naver' : false;
  const isHomepageUserValue = userProfile ? userProfile.oauthAccount.provider === 'homePage' : false;

  return {
    userProfile,
    loading,
    error,
    refetch: fetchUserProfile,
    hasGoogleAuth: hasGoogleAuthValue,
    hasNaverAuth: hasNaverAuthValue,
    isHomepageUser: isHomepageUserValue,
    availableServices: userProfile?.availableServices || [],
    roles: userProfile?.authorization.roles || [],
    permissions: userProfile?.authorization.permissions || [],
  };
};

/**
 * 특정 권한 확인 훅
 */
export const usePermission = (permission: string): boolean => {
  const { permissions } = useUserProfile();
  return permissions.includes(permission);
};

/**
 * 특정 역할 확인 훅
 */
export const useRole = (role: string): boolean => {
  const { roles } = useUserProfile();
  return roles.includes(role);
};

/**
 * 여러 권한 확인 훅 (AND 조건)
 */
export const usePermissions = (requiredPermissions: string[]): boolean => {
  const { permissions } = useUserProfile();
  return requiredPermissions.every(permission => permissions.includes(permission));
};

/**
 * 여러 역할 중 하나 확인 훅 (OR 조건)
 */
export const useAnyRole = (roles: string[]): boolean => {
  const { roles: userRoles } = useUserProfile();
  return roles.some(role => userRoles.includes(role));
};
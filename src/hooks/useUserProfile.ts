/**
 * useUserProfile Hook - Redux 기반 사용자 프로필 관리
 *
 * portal-client 패턴을 따르는 사용자 프로필 Hook입니다.
 * Redux authSlice를 래핑하여 OAuth, 권한, 서비스 정보를 제공합니다.
 *
 * 특징:
 * - Redux Store에서 사용자 프로필 정보를 가져옴 (API 호출 없음)
 * - OAuth 정보, 권한 정보, 서비스 목록을 포함한 완전한 사용자 프로필
 * - 구글/네이버 인증 상태 확인 유틸리티 제공
 * - 접근 가능한 서비스 목록 제공
 *
 * 사용 예시:
 * ```typescript
 * const { userProfile, loading, availableServices, roles, permissions } = useUserProfile();
 *
 * // 권한 확인
 * if (usePermission('admin.view')) {
 *   return <AdminPanel />;
 * }
 *
 * // 역할 확인
 * if (useRole('admin')) {
 *   return <AdminDashboard />;
 * }
 * ```
 *
 * @see portal-client/src/hooks/useUserProfile.ts - 참조 구현
 */
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/authSlice';
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

export const useUserProfile = (): UseUserProfileReturn => {
  const dispatch = useAppDispatch();
  const { user: userProfile, isLoading: loading, error } = useAppSelector((state) => state.auth);

  // refetch 함수 - Redux action을 dispatch하여 API 호출
  const refetch = async (): Promise<void> => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (_err) {
      // Error handled by Redux
    }
  };

  // 편의 함수들
  const hasGoogleAuthValue = userProfile ? userProfile.oauthAccount.provider === 'google' : false;
  const hasNaverAuthValue = userProfile ? userProfile.oauthAccount.provider === 'naver' : false;
  const isHomepageUserValue = userProfile
    ? userProfile.oauthAccount.provider === 'homePage'
    : false;

  return {
    userProfile,
    loading,
    error,
    refetch,
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
  return requiredPermissions.every((permission) => permissions.includes(permission));
};

/**
 * 여러 역할 중 하나 확인 훅 (OR 조건)
 */
export const useAnyRole = (roles: string[]): boolean => {
  const { roles: userRoles } = useUserProfile();
  return roles.some((role) => userRoles.includes(role));
};

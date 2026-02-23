import { useQueryClient } from '@tanstack/react-query';
import { useMyProfile } from '@/hooks/queries/auth';
import { queryKeys } from '@/hooks/queries/keys';
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
  const queryClient = useQueryClient();
  const { data: userProfile = null, isPending: loading, error } = useMyProfile();

  const refetch = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.myProfile() });
  };

  const hasGoogleAuth = userProfile ? userProfile.oauthAccount.provider === 'google' : false;
  const hasNaverAuth = userProfile ? userProfile.oauthAccount.provider === 'naver' : false;
  const isHomepageUser = userProfile ? userProfile.oauthAccount.provider === 'homePage' : false;

  return {
    userProfile,
    loading,
    error: error ? String(error) : null,
    refetch,
    hasGoogleAuth,
    hasNaverAuth,
    isHomepageUser,
    availableServices: userProfile?.availableServices ?? [],
    roles: userProfile?.authorization.roles ?? [],
    permissions: userProfile?.authorization.permissions ?? [],
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

import { isAdminLevelRole, ADMIN_LEVEL_ROLES } from '@krgeobuk/core/constants';

// Interface for user with possible role structures
interface UserWithRoles {
  id: string;
  authorization?: {
    roles?: string[];
    permissions?: string[];
  };
}

/**
 * Check if a user has admin role access
 * Uses shared-lib's isAdminLevelRole for standardized role checking
 *
 * @param user - User object with roles or role information
 * @returns boolean indicating if user has admin access
 */
export function hasAdminRole(user: UserWithRoles | null): boolean {
  if (!user) {
    return false;
  }

  // Check authorization.roles (현재 API 응답 구조)
  if (user.authorization?.roles && Array.isArray(user.authorization.roles)) {
    return user.authorization.roles.some((roleName: string) => isAdminLevelRole(roleName));
  }

  return false;
}

/**
 * Get admin role names for display
 * @returns Array of admin role names from shared-lib constants
 */
export function getAdminRoleNames(): string[] {
  return [...ADMIN_LEVEL_ROLES];
}

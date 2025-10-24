import { isAdminLevelRole, ADMIN_LEVEL_ROLES } from '@krgeobuk/core/constants';

// Interface for user with possible role structures
interface UserWithRoles {
  id: string;
  roles?: Array<{ name?: string }>;
  roleNames?: string[];
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

  // Check if user has roles array
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((role: { name?: string }) => isAdminLevelRole(role.name || ''));
  }

  // Check if user has role names directly
  if (user.roleNames && Array.isArray(user.roleNames)) {
    return user.roleNames.some((roleName: string) => isAdminLevelRole(roleName));
  }

  return false;
}

/**
 * Get admin role names for display
 * @returns Array of admin role names from shared-lib constants
 */
export function getAdminRoleNames(): string[] {
  // Import dynamically to avoid circular dependencies
  // const { ADMIN_LEVEL_ROLES } = require('@krgeobuk/core/constants');
  return [...ADMIN_LEVEL_ROLES];
}

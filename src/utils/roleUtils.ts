// Admin role names that grant access to the admin portal
const ADMIN_ROLE_NAMES = [
  'super-admin',
  'system-admin', 
  'portal-admin',
  'admin'
];

// Interface for user with possible role structures
interface UserWithRoles {
  id: string;
  roles?: Array<{ name?: string }>;
  roleNames?: string[];
}

/**
 * Check if a user has admin role access
 * @param user - User object with roles or role information
 * @returns boolean indicating if user has admin access
 */
export function hasAdminRole(user: UserWithRoles | null): boolean {
  if (!user) {
    return false;
  }

  // Check if user has roles array
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((role: { name?: string }) => 
      ADMIN_ROLE_NAMES.includes(role.name?.toLowerCase() || '')
    );
  }

  // Check if user has role names directly
  if (user.roleNames && Array.isArray(user.roleNames)) {
    return user.roleNames.some((roleName: string) => 
      ADMIN_ROLE_NAMES.includes(roleName.toLowerCase())
    );
  }

  // For testing/development: temporarily allow if user has id (bypass admin check)
  // TODO: Remove this once proper role system is integrated
  if (process.env.NODE_ENV === 'development' && user.id) {
    return true;
  }

  return false;
}

/**
 * Get admin role names for display
 * @returns Array of admin role names
 */
export function getAdminRoleNames(): string[] {
  return [...ADMIN_ROLE_NAMES];
}
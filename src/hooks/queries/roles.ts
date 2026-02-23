import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from './keys';
import type { RoleSearchQuery } from '@krgeobuk/role';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRoles(query: RoleSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.roles.list(query),
    queryFn: () => roleService.getRoles(query),
    staleTime: 2 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRoleById(roleId: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(roleId ?? ''),
    queryFn: () => roleService.getRoleById(roleId!),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUserRoles(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.byUser(userId ?? ''),
    queryFn: () => roleService.getUserRoles(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

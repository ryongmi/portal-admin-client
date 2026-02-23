import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from './keys';
import type { PermissionSearchQuery } from '@krgeobuk/permission';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePermissions(query: PermissionSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.permissions.list(query),
    queryFn: () => permissionService.getPermissions(query),
    staleTime: 2 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePermissionById(permissionId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.detail(permissionId ?? ''),
    queryFn: () => permissionService.getPermissionById(permissionId!),
    enabled: !!permissionId,
    staleTime: 5 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.byRole(roleId ?? ''),
    queryFn: () => permissionService.getRolePermissions(roleId!),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUserPermissions(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.byUser(userId ?? ''),
    queryFn: () => permissionService.getUserPermissions(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

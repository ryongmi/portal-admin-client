import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.byRole(roleId ?? ''),
    queryFn: () => permissionService.getRolePermissions(roleId!),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

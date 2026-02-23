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

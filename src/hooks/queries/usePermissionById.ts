import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePermissionById(permissionId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.detail(permissionId ?? ''),
    queryFn: () => permissionService.getPermissionById(permissionId!),
    enabled: !!permissionId,
    staleTime: 5 * 60 * 1000,
  });
}

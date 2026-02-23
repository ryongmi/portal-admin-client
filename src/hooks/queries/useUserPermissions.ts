import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUserPermissions(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.permissions.byUser(userId ?? ''),
    queryFn: () => permissionService.getUserPermissions(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUserRoles(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.byUser(userId ?? ''),
    queryFn: () => roleService.getUserRoles(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

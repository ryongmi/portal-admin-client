import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRoleById(roleId: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(roleId ?? ''),
    queryFn: () => roleService.getRoleById(roleId!),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

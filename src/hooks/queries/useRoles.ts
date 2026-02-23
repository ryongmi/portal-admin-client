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

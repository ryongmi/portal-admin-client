import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { queryKeys } from './keys';
import type { UserSearchQuery } from '@krgeobuk/user';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUsers(query: UserSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.getUsers(query),
    staleTime: 2 * 60 * 1000,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ''),
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

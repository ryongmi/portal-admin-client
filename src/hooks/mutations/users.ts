import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { queryKeys } from '../queries/keys';
import type { User } from '@/types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

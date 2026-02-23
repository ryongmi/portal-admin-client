import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    },
  });
}

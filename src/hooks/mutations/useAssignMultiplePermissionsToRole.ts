import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignMultiplePermissionsToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      permissionService.assignMultiplePermissionsToRole(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      permissionService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}

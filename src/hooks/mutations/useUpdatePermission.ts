import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

interface UpdatePermissionData {
  action?: string;
  description?: string | null;
  serviceId?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionData }) =>
      permissionService.updatePermission(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.detail(id) });
    },
  });
}

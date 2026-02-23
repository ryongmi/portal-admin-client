import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

interface CreatePermissionData {
  action: string;
  description?: string | null;
  serviceId: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionData) => permissionService.createPermission(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    },
  });
}

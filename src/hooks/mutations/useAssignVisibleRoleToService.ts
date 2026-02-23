import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignVisibleRoleToService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, roleId }: { serviceId: string; roleId: string }) =>
      serviceService.assignVisibleRoleToService(serviceId, roleId),
    onSuccess: (_, { serviceId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.visibleRoles(serviceId) });
    },
  });
}

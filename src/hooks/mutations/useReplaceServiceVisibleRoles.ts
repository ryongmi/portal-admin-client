import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReplaceServiceVisibleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, roleIds }: { serviceId: string; roleIds: string[] }) =>
      serviceService.replaceServiceVisibleRoles(serviceId, roleIds),
    onSuccess: (_, { serviceId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.visibleRoles(serviceId) });
    },
  });
}
